'use strict';
// Source strings are captured once. Translation never mutates the English resource.
(() => {
  const en = window.STORY_I18N_EN || {};
  const zh = window.STORY_I18N_ZH || {};
  const attrs = ['alt', 'title', 'aria-label', 'data-caption', 'data-alt', 'data-label', 'content'];
  const nodes = [];
  const attributes = [];
  const skip = 'SCRIPT,STYLE,PRE,CODE';
  const normalize = value => value.replace(/\s+/g, ' ').trim();
  let language = 'en';

  function translate(value) {
    const key = normalize(value);
    if (language === 'en' || !key) return value;
    const target = zh[key];
    if (!target) return value;
    return value.replace(/\S(?:[\s\S]*\S)?/, target);
  }
  function collect() {
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.parentElement && !node.parentElement.closest(skip) && normalize(node.nodeValue)
          ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    while (walker.nextNode()) nodes.push([walker.currentNode, walker.currentNode.nodeValue]);
    document.querySelectorAll('*').forEach(el => attrs.forEach(name => {
      if (el.hasAttribute(name) && !el.closest(skip)) attributes.push([el, name, el.getAttribute(name)]);
    }));
  }
  function apply(next) {
    language = next === 'zh-CN' ? 'zh-CN' : 'en';
    document.documentElement.lang = language;
    document.documentElement.classList.toggle('lang-zh', language === 'zh-CN');
    nodes.forEach(([node, source]) => { node.nodeValue = translate(source); });
    attributes.forEach(([el, name, source]) => { el.setAttribute(name, translate(source)); });
    document.querySelectorAll('.language-switch button').forEach(button =>
      button.setAttribute('aria-pressed', String(button.dataset.lang === language)));
    try { localStorage.setItem('story-language', language); } catch (_) { /* private mode */ }
    document.dispatchEvent(new CustomEvent('story:language', { detail: { language } }));
  }
  window.storyI18n = { get language() { return language; }, t: value => language === 'zh-CN' ? (zh[normalize(value)] || value) : (en[normalize(value)] || value), apply };
  document.addEventListener('DOMContentLoaded', () => {
    collect();
    let saved = 'en';
    try { saved = localStorage.getItem('story-language') || 'en'; } catch (_) { /* private mode */ }
    apply(saved);
    document.querySelectorAll('.language-switch button').forEach(button => button.addEventListener('click', () => apply(button.dataset.lang)));
  });
})();
