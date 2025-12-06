const gnbMenu = document.querySelector('.gnb-menu');
const gnbLinks = gnbMenu.querySelectorAll('a');
const indicator = document.querySelector('.gnb-indicator');
const sections = document.querySelectorAll('section.page-section');

function moveIndicator(link) {
  const rect = link.getBoundingClientRect();
  const parentRect = gnbMenu.getBoundingClientRect();
  indicator.style.width = `${rect.width}px`;
  indicator.style.left = `${rect.left - parentRect.left}px`;
}

window.addEventListener('load', () => {
  const active = gnbMenu.querySelector('a.active');
  if (active) moveIndicator(active);
});

gnbLinks.forEach(link => {
  link.addEventListener('click', e => {
    gnbLinks.forEach(a => a.classList.remove('active'));
    e.currentTarget.classList.add('active');
    moveIndicator(e.currentTarget);
  });
});

window.addEventListener('scroll', () => {
  let current = '';
  const scrollYPos = window.scrollY + 160;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    if (scrollYPos >= top && scrollYPos < top + height) {
      current = section.id;
    }
  });
  gnbLinks.forEach(link => {
    const isActive = link.getAttribute('href').includes(current);
    link.classList.toggle('active', isActive);
    if (isActive) moveIndicator(link);
  });
});
