(function () {
  'use strict';

  var filters = document.querySelectorAll('.career-filter');
  var programs = document.querySelectorAll('.career-program-card');
  var applicationForm = document.getElementById('career-application-form');
  var applicationStatus = document.getElementById('career-form-status');
  var programSelect = document.getElementById('career-domain');

  filters.forEach(function (filter) {
    filter.addEventListener('click', function () {
      var selectedCategory = filter.getAttribute('data-filter');

      filters.forEach(function (button) {
        var isActive = button === filter;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });

      programs.forEach(function (program) {
        var matches = selectedCategory === 'all' || program.getAttribute('data-category') === selectedCategory;
        program.hidden = !matches;
      });
    });
  });

  document.querySelectorAll('.career-apply-link').forEach(function (link) {
    link.addEventListener('click', function () {
      if (programSelect) {
        programSelect.value = link.getAttribute('data-program');
        programSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });

  if (applicationForm && applicationStatus) {
    var requiredSelects = Array.from(applicationForm.querySelectorAll('.career-select')).filter(function (select) {
      return select.querySelector('.contact-select-trigger').getAttribute('aria-required') === 'true';
    });
    var successDialog = document.getElementById('career-success-dialog');
    var submitButton = applicationForm.querySelector('[type="submit"]');

    if (successDialog) {
      var closeButton = successDialog.querySelector('.contact-success-close');
      closeButton.addEventListener('click', function () {
        successDialog.close();
      });
      successDialog.addEventListener('click', function (event) {
        if (event.target === successDialog) successDialog.close();
      });
      successDialog.addEventListener('close', function () {
        submitButton.focus();
      });
    }

    requiredSelects.forEach(function (select) {
      var valueInput = select.closest('.career-field').querySelector('input[type="hidden"]');
      valueInput.addEventListener('change', function () {
        var hasMissingSelection = requiredSelects.some(function (requiredSelect) {
          return !requiredSelect.closest('.career-field').querySelector('input[type="hidden"]').value;
        });
        if (!hasMissingSelection && applicationStatus.classList.contains('is-error')) {
          applicationStatus.hidden = true;
          applicationStatus.textContent = '';
          applicationStatus.classList.remove('is-error');
        }
      });
    });

    applicationForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      var missingSelect = requiredSelects.find(function (select) {
        return !select.closest('.career-field').querySelector('input[type="hidden"]').value;
      });
      if (missingSelect) {
        var field = missingSelect.closest('.career-field');
        var trigger = missingSelect.querySelector('.contact-select-trigger');
        var fieldName = field.querySelector('label').textContent.replace('*', '').trim().toLowerCase();
        field.classList.add('is-invalid');
        trigger.setAttribute('aria-invalid', 'true');
        applicationStatus.hidden = false;
        applicationStatus.classList.remove('is-success');
        applicationStatus.classList.add('is-error');
        applicationStatus.textContent = 'Please select ' + fieldName + ' before sending your application.';
        trigger.focus();
        if (trigger.getAttribute('aria-expanded') !== 'true') trigger.click();
        return;
      }

      applicationStatus.hidden = false;
      applicationStatus.classList.remove('is-error', 'is-success');
      applicationStatus.textContent = 'Sending your application…';

      submitButton.disabled = true;
      applicationForm.setAttribute('aria-busy', 'true');

      try {
        var response = await fetch(applicationForm.action, {
          method: 'POST',
          body: new FormData(applicationForm),
        });
        var result = await response.json();

        if (!response.ok || !result || !result.success) {
          throw new Error(result && result.message ? result.message : 'The application service could not send your details.');
        }

        applicationForm.reset();
        requiredSelects.forEach(function (select) {
          var valueInput = select.closest('.career-field').querySelector('input[type="hidden"]');
          valueInput.value = '';
          valueInput.dispatchEvent(new Event('change', { bubbles: true }));
        });
        applicationStatus.hidden = true;
        applicationStatus.textContent = '';
        applicationStatus.classList.remove('is-error', 'is-success');
        if (successDialog && !successDialog.open) successDialog.showModal();
      } catch (error) {
        applicationStatus.textContent = 'We couldn’t send your application. Please try again or contact us directly.';
        applicationStatus.classList.add('is-error');
        console.error('Internship application submission failed:', error);
      } finally {
        submitButton.disabled = false;
        applicationForm.removeAttribute('aria-busy');
      }
    });
  }
})();
