/* ═══════════════════════════════════════════
   CONSULTATION REQUEST — Two-step wizard logic
   Paste before </body>, after your existing
   scripts, or merge into your main script block.

   Submits to Formspree. Swap FORM_ENDPOINT below
   for a dedicated endpoint if you'd like consult
   requests separated from the general contact form.
═══════════════════════════════════════════ */
(function () {
  'use strict';

  var FORM_ENDPOINT = 'https://formspree.io/f/mkoynllz';

  var form = document.getElementById('consultForm');
  if (!form) return; // section not present on this page

  var step1 = document.getElementById('consultStep1');
  var step2 = document.getElementById('consultStep2');
  var title = document.getElementById('consultTitle');
  var track = document.getElementById('consultTrack');
  var ind1 = document.getElementById('consultStepInd1');
  var ind2 = document.getElementById('consultStepInd2');

  var nextBtn = document.getElementById('consultNextBtn');
  var backBtn = document.getElementById('consultBackBtn');
  var submitBtn = document.getElementById('consultSubmitBtn');

  var priorityError = document.getElementById('consultPriorityError');
  var cityError = document.getElementById('consultCityError');
  var step2Error = document.getElementById('consultStep2Error');
  var cityInput = document.getElementById('consultCity');

  var successEl = document.getElementById('consultSuccess');

  function trackEvent(name, params) {
    if (typeof gtag !== 'undefined') {
      gtag('event', name, params || {});
    }
  }

  function goToStep(n) {
    if (n === 1) {
      step2.classList.remove('is-active');
      step1.classList.add('is-active');
      title.textContent = 'Step 1 — Your Priorities';
      ind1.classList.add('is-active'); ind1.classList.remove('is-done');
      ind2.classList.remove('is-active'); ind2.classList.remove('is-done');
      track.classList.remove('is-filled');
      step1.querySelector('input, button')?.focus();
    } else {
      step1.classList.remove('is-active');
      step2.classList.add('is-active');
      title.textContent = 'Step 2 — Your Details';
      ind1.classList.remove('is-active'); ind1.classList.add('is-done');
      ind2.classList.add('is-active');
      track.classList.add('is-filled');
      document.getElementById('consultFirst')?.focus();
      trackEvent('consult_step_2', {});
    }
  }

  function getCheckedPriorities() {
    return Array.prototype.slice
      .call(form.querySelectorAll('input[name="priorities"]:checked'))
      .map(function (el) { return el.value; });
  }

  function validateStep1() {
    var valid = true;
    var priorities = getCheckedPriorities();

    if (priorities.length === 0) {
      priorityError.textContent = 'Select at least one priority.';
      valid = false;
    } else {
      priorityError.textContent = '';
    }

    if (!cityInput.value.trim()) {
      cityError.textContent = 'This field is required.';
      cityInput.classList.add('has-error');
      valid = false;
    } else {
      cityError.textContent = '';
      cityInput.classList.remove('has-error');
    }

    return valid;
  }

  function validateStep2() {
    var required = step2.querySelectorAll('[required]');
    var valid = true;
    required.forEach(function (field) {
      if (!field.value.trim()) {
        field.classList.add('has-error');
        valid = false;
      } else {
        field.classList.remove('has-error');
      }
    });
    step2Error.textContent = valid ? '' : 'Please fill in all required fields.';
    return valid;
  }

  nextBtn.addEventListener('click', function () {
    if (validateStep1()) {
      goToStep(2);
    }
  });

  backBtn.addEventListener('click', function () {
    goToStep(1);
  });

  cityInput.addEventListener('input', function () {
    if (cityInput.value.trim()) {
      cityError.textContent = '';
      cityInput.classList.remove('has-error');
    }
  });

  form.querySelectorAll('#consultStep2 input').forEach(function (field) {
    field.addEventListener('input', function () {
      field.classList.remove('has-error');
    });
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!validateStep2()) return;

    submitBtn.querySelector('span').textContent = 'Sending…';
    submitBtn.disabled = true;
    backBtn.disabled = true;

    var formData = new FormData(form);
    formData.set('priorities', getCheckedPriorities().join(', '));
    formData.set('_subject', 'New Consultation Request — Nexus Digital Solutions');

    try {
      var res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        trackEvent('consult_submit', { priorities: getCheckedPriorities().join(',') });
        form.style.display = 'none';
        document.querySelector('.consult-steps').style.display = 'none';
        successEl.classList.add('is-active');
      } else {
        step2Error.textContent = 'Something went wrong — please email us directly or try again.';
        submitBtn.querySelector('span').textContent = 'Request Consultation';
        submitBtn.disabled = false;
        backBtn.disabled = false;
      }
    } catch (err) {
      step2Error.textContent = 'Something went wrong — please email us directly or try again.';
      submitBtn.querySelector('span').textContent = 'Request Consultation';
      submitBtn.disabled = false;
      backBtn.disabled = false;
    }
  });

})();