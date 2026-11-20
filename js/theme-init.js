(function () {
  try {
    var savedTheme = window.localStorage.getItem('daxentra-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  } catch (error) {
    console.warn('Theme preference could not be loaded.', error);
  }
})();
