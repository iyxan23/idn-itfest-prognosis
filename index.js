const header = document.getElementById("header");
const main = document.getElementById("main");
const carousel = document.getElementById("carousel");
const bottomButtons = document.getElementById("bottom-buttons");

function updateSizes() {
    const headerRect = header.getBoundingClientRect();
    const bottomButtonsRect = bottomButtons.getBoundingClientRect();

    main.style.paddingTop = `calc(${headerRect.height}px + 3rem)`;
    carousel.style.height = `calc(100vh - ${headerRect.height}px - ${bottomButtonsRect.height}px - 6.5rem)`
}

onresize = updateSizes;
updateSizes();