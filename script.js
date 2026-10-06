if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });
} else {
  document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
}

console.log('%cUn secret se cache sur cette page.', 'font-family:serif;font-size:14px;font-weight:bold;color:#C4441E;');
console.log('%cIndice : ça glisse, ça n\'a pas de pattes, et ça se joue aux flèches.', 'font-family:monospace;font-size:12px;color:#8C8272;');

(function () {
  var overlay = document.getElementById('lightboxOverlay');
  if (!overlay) return;
  var titleEl = document.getElementById('lightboxTitle');
  var imageEl = document.getElementById('lightboxImage');
  var dotsEl = document.getElementById('lightboxDots');
  var prevBtn = document.getElementById('lightboxPrev');
  var nextBtn = document.getElementById('lightboxNext');
  var closeBtn = document.getElementById('lightboxClose');
  var images = [];
  var index = 0;

  function render() {
    var current = images[index];
    imageEl.src = current.src;
    imageEl.alt = current.alt || '';
    dotsEl.innerHTML = '';
    images.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'lightbox-dot' + (i === index ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Visuel ' + (i + 1));
      dot.addEventListener('click', function () { index = i; render(); });
      dotsEl.appendChild(dot);
    });
    var multi = images.length > 1;
    prevBtn.hidden = !multi;
    nextBtn.hidden = !multi;
    dotsEl.hidden = !multi;
  }

  function open(gallery, title) {
    images = gallery;
    index = 0;
    titleEl.textContent = title || '';
    render();
    overlay.hidden = false;
  }

  function close() { overlay.hidden = true; }
  function prev() { index = (index - 1 + images.length) % images.length; render(); }
  function next() { index = (index + 1) % images.length; render(); }

  document.querySelectorAll('[data-gallery]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var gallery;
      try { gallery = JSON.parse(trigger.getAttribute('data-gallery')); } catch (e) { return; }
      open(gallery, trigger.getAttribute('data-title'));
    });
  });

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function (e) {
    if (overlay.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });
})();

document.querySelectorAll('.footer__hint').forEach(function (btn) {
  var original = btn.textContent;
  var hint = "Indice : ça glisse, ça n'a pas de pattes — tape S-N-A-K-E sur ton clavier";
  btn.addEventListener('click', function () {
    var expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    btn.textContent = expanded ? original : hint;
  });
});

(function () {
  var overlay = document.getElementById('snakeOverlay');
  if (!overlay) return;
  var closeBtn = document.getElementById('snakeClose');
  var canvas = document.getElementById('snakeCanvas');
  var scoreEl = document.getElementById('snakeScore');
  var ctx = canvas.getContext('2d');
  var cell = 20, cols = canvas.width / cell, rows = canvas.height / cell;
  var snake, dir, nextDir, food, score, over, loopId;
  var typedBuffer = '';

  function randomFood() {
    var pos;
    do {
      pos = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    } while (snake.some(function (s) { return s.x === pos.x && s.y === pos.y; }));
    return pos;
  }

  function resetGame() {
    snake = [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    over = false;
    food = randomFood();
    scoreEl.textContent = 'Score : 0';
  }

  function draw() {
    ctx.fillStyle = '#0B0906';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#8A6D3B';
    ctx.fillRect(food.x * cell + 2, food.y * cell + 2, cell - 4, cell - 4);

    snake.forEach(function (s, i) {
      ctx.fillStyle = i === 0 ? '#E0632F' : '#C4441E';
      ctx.fillRect(s.x * cell + 1, s.y * cell + 1, cell - 2, cell - 2);
    });

    if (over) {
      ctx.fillStyle = 'rgba(11,9,6,0.88)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#D9CDB8';
      ctx.font = 'bold 16px serif';
      ctx.textAlign = 'center';
      ctx.fillText('FIN DU RITUEL', canvas.width / 2, canvas.height / 2 - 8);
      ctx.font = '11px monospace';
      ctx.fillText('Entrée pour recommencer', canvas.width / 2, canvas.height / 2 + 14);
    }
  }

  function tick() {
    if (over) return;
    dir = nextDir;
    var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows ||
        snake.some(function (s) { return s.x === head.x && s.y === head.y; })) {
      over = true;
      draw();
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 1;
      scoreEl.textContent = 'Score : ' + score;
      food = randomFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function openGame() {
    overlay.hidden = false;
    resetGame();
    draw();
    clearInterval(loopId);
    loopId = setInterval(tick, 120);
  }

  function closeGame() {
    overlay.hidden = true;
    clearInterval(loopId);
  }

  document.addEventListener('keydown', function (e) {
    if (overlay.hidden) {
      if (/^[a-z]$/i.test(e.key)) {
        typedBuffer = (typedBuffer + e.key.toLowerCase()).slice(-5);
        if (typedBuffer === 'snake') {
          openGame();
          typedBuffer = '';
        }
      }
      return;
    }
    if (e.key === 'Escape') { closeGame(); return; }
    if (over && e.key === 'Enter') { resetGame(); draw(); return; }
    var map = {
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }
    };
    var d = map[e.key];
    if (d) {
      e.preventDefault();
      if (d.x !== -dir.x || d.y !== -dir.y) nextDir = d;
    }
  });

  closeBtn.addEventListener('click', closeGame);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeGame(); });
})();

(function () {
  var intro = document.getElementById('sealIntro');
  if (!intro) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    intro.remove();
    return;
  }

  document.body.style.overflow = 'hidden';
  var closed = false;

  function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Enter') closeSeal();
  }

  function closeSeal() {
    if (closed) return;
    closed = true;
    clearTimeout(autoTimer);
    document.removeEventListener('keydown', onKey);
    intro.classList.add('seal-intro--closing');
    document.body.style.overflow = '';
    setTimeout(function () { intro.remove(); }, 950);
  }

  var autoTimer = setTimeout(closeSeal, 2500);

  intro.addEventListener('click', closeSeal);
  document.getElementById('sealSkip').addEventListener('click', function (e) {
    e.stopPropagation();
    closeSeal();
  });
  document.addEventListener('keydown', onKey);
})();
