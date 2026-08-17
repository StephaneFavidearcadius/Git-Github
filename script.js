(function () {
  'use strict';

  var currentSlide = 0;
  var totalSlides = 0;
  var isTransitioning = false;
  var slides = [];
  var transitionDuration = 350;

  var slidesContainer = document.querySelector('.slides');
  var prevBtn = document.querySelector('.nav__btn--prev');
  var nextBtn = document.querySelector('.nav__btn--next');
  var currentDisplay = document.querySelector('.nav__current');
  var totalDisplay = document.querySelector('.nav__total');
  var progressFill = document.querySelector('.progress-bar__fill');

  function init() {
    initSlides();
    initNavigation();
    initKeyboardNavigation();
    initProgress();
    initCopyButtons();
    initQuizzes();
    initRevealAnswers();
    initChecklist();
    showSlide(0);
  }

  function initSlides() {
    var allSlides = document.querySelectorAll('.slide');
    totalSlides = allSlides.length;
    totalDisplay.textContent = String(totalSlides).padStart(2, '0');
    allSlides.forEach(function (slide, index) {
      slides.push(slide);
      slide.setAttribute('data-index', index);
      slide.classList.remove('active');
    });
  }

  function showSlide(index) {
    if (index < 0 || index >= totalSlides || isTransitioning) return;
    isTransitioning = true;
    var direction = index > currentSlide ? 1 : -1;

    if (slides[currentSlide]) {
      var exitingSlide = slides[currentSlide];
      exitingSlide.classList.remove('active');
      if (direction > 0) {
        exitingSlide.classList.add('exit-left');
      }
      slides[index].style.transform = direction > 0 ? 'translateX(30px)' : 'translateX(-30px)';
    }

    void slides[index].offsetWidth;

    slides[index].classList.add('active');
    slides[index].style.transform = '';

    currentSlide = index;
    updateProgress();
    updateNavButtons();

    setTimeout(function () {
      slides.forEach(function (s) {
        s.classList.remove('exit-left');
      });
      isTransitioning = false;
    }, transitionDuration + 50);
  }

  function nextSlide() {
    if (currentSlide < totalSlides - 1) showSlide(currentSlide + 1);
  }

  function prevSlide() {
    if (currentSlide > 0) showSlide(currentSlide - 1);
  }

  function initNavigation() {
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
  }

  function updateNavButtons() {
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === totalSlides - 1;
  }

  function initKeyboardNavigation() {
    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'Home':
          e.preventDefault();
          showSlide(0);
          break;
        case 'End':
          e.preventDefault();
          showSlide(totalSlides - 1);
          break;
      }
    });
  }

  function initProgress() {
    updateProgress();
  }

  function updateProgress() {
    var current = String(currentSlide + 1).padStart(2, '0');
    currentDisplay.textContent = current;
    var percent = ((currentSlide + 1) / totalSlides) * 100;
    progressFill.style.width = percent + '%';
  }

  function initCopyButtons() {
    var buttons = document.querySelectorAll('.copy-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-copy');
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            onCopySuccess(btn);
          }).catch(function () {
            fallbackCopy(text, btn);
          });
        } else {
          fallbackCopy(text, btn);
        }
      });
    });
  }

  function fallbackCopy(text, btn) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      onCopySuccess(btn);
    } catch (err) {}
    document.body.removeChild(textarea);
  }

  function onCopySuccess(btn) {
    var originalText = btn.textContent;
    btn.textContent = 'COPIED';
    btn.classList.add('copy-btn--copied');
    setTimeout(function () {
      btn.textContent = originalText;
      btn.classList.remove('copy-btn--copied');
    }, 1500);
  }

  function initQuizzes() {
    var quizzes = document.querySelectorAll('.quiz');
    quizzes.forEach(function (quiz) {
      var answer = quiz.getAttribute('data-answer');
      var options = quiz.querySelectorAll('.quiz__option');
      var feedback = quiz.querySelector('.quiz__feedback');
      var answered = false;
      options.forEach(function (option) {
        option.addEventListener('click', function () {
          if (answered) return;
          answered = true;
          var selected = option.getAttribute('data-option');
          var isCorrect = selected === answer;
          if (isCorrect) {
            option.classList.add('quiz__option--correct');
            feedback.textContent = 'CORRECT';
            feedback.className = 'quiz__feedback quiz__feedback--correct';
          } else {
            option.classList.add('quiz__option--incorrect');
            options.forEach(function (opt) {
              if (opt.getAttribute('data-option') === answer) {
                opt.classList.add('quiz__option--correct');
              }
            });
            feedback.textContent = 'INCORRECT';
            feedback.className = 'quiz__feedback quiz__feedback--incorrect';
          }
          options.forEach(function (opt) {
            opt.style.pointerEvents = 'none';
          });
        });
      });
    });
  }

  function initRevealAnswers() {
    var reveals = document.querySelectorAll('.reveal');
    reveals.forEach(function (reveal) {
      var btn = reveal.querySelector('.reveal__btn');
      var answer = reveal.querySelector('.reveal__answer');
      btn.addEventListener('click', function () {
        var isHidden = answer.hasAttribute('hidden');
        if (isHidden) {
          answer.removeAttribute('hidden');
          btn.textContent = 'HIDE ANSWER';
        } else {
          answer.setAttribute('hidden', '');
          btn.textContent = 'REVEAL ANSWER';
        }
      });
    });
  }

  function initChecklist() {
    var saved = {};
    try {
      var stored = sessionStorage.getItem('git-course-checklist');
      if (stored) saved = JSON.parse(stored);
    } catch (e) {}
    var checkboxes = document.querySelectorAll('.checklist__item input[type="checkbox"]');
    checkboxes.forEach(function (cb, index) {
      var key = 'check-' + index;
      if (saved[key]) cb.checked = true;
      cb.addEventListener('change', function () {
        saved[key] = cb.checked;
        try {
          sessionStorage.setItem('git-course-checklist', JSON.stringify(saved));
        } catch (e) {}
      });
    });
  }

  function initSwipe() {
    var startX = 0;
    var startY = 0;
    var threshold = 50;
    slidesContainer.addEventListener('touchstart', function (e) {
      startX = e.changedTouches[0].screenX;
      startY = e.changedTouches[0].screenY;
    }, { passive: true });
    slidesContainer.addEventListener('touchend', function (e) {
      var endX = e.changedTouches[0].screenX;
      var endY = e.changedTouches[0].screenY;
      var diffX = startX - endX;
      var diffY = startY - endY;
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
        if (diffX > 0) nextSlide();
        else prevSlide();
      }
    }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    init();
    initSwipe();
  });
})();