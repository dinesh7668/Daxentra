(function () {
  try {
    var savedTheme = window.localStorage.getItem('daxentra-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  } catch (error) {
    console.warn('Theme preference could not be loaded.', error);
  }

  var lightLogo = 'assets/images/Logo/Daxentra_Studios_Green Orbit_Logo_for_light_theme.png';
  var darkLogo = 'assets/images/Logo/full_name_logo.png';

  document.addEventListener('DOMContentLoaded', function () {
    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    var logos = document.querySelectorAll('.logo-image');

    logos.forEach(function (logo) {
      logo.src = isLight ? lightLogo : darkLogo;
    });
  });
})();
