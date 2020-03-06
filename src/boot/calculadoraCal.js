
/*#### Drag and Drop ####*/
function startDrag(ev) {
    ev.dataTransfer.setData("idSelec", ev.target.id);
}

function endDrag(ev) {
    ev.dataTransfer.clearData();
}

function zoneDrop(ev) {
    ev.preventDefault();
}

function drop(ev) {
    ev.preventDefault();

    const myNode = document.querySelector("#destiDrag");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }


    const id = ev.dataTransfer.getData("idSelec");
    if (id === "pocCap") {
        const elmnt = document.querySelector("#pocCap");
        const cln = elmnt.cloneNode(true);
        document.querySelector("#destiDrag").appendChild(cln);
        document.querySelector("#activitat").value = 1.2;

    } else if (id === "lleuger") {
        const elmnt = document.querySelector("#lleuger");
        const cln = elmnt.cloneNode(true);
        document.querySelector("#destiDrag").appendChild(cln);
        document.querySelector("#activitat").value = 1.375;

    } else if (id === "moderat") {
        const elmnt = document.querySelector("#moderat");
        const cln = elmnt.cloneNode(true);
        document.querySelector("#destiDrag").appendChild(cln);
        document.querySelector("#activitat").value = 1.55;

    } else if (id === "fort") {
        const elmnt = document.querySelector("#fort");
        const cln = elmnt.cloneNode(true);
        document.querySelector("#destiDrag").appendChild(cln);
        document.querySelector("#activitat").value = 1.725;

    } else if (id === "professional") {
        const elmnt = document.querySelector("#professional");
        const cln = elmnt.cloneNode(true);
        document.querySelector("#destiDrag").appendChild(cln);
        document.querySelector("#activitat").value = 1.9;

    }

}