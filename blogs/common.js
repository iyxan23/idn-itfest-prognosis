const header = document.getElementById("header");
const main = document.getElementById("main");

function updateSizes() {
    const headerRect = header.getBoundingClientRect();

    main.style.paddingTop = `calc(${headerRect.height}px + 20vh)`;
}

onresize = updateSizes;
updateSizes();