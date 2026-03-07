const btn = document.getElementById("panel_switch");
const panel1 = document.getElementById("panel_data");
const panel2 = document.getElementById("panel_alt");

let showingFirst = true;

btn.addEventListener("click", () => {

    if(showingFirst){
        panel1.style.display = "none";
        panel2.style.display = "block";
    }else{
        panel1.style.display = "block";
        panel2.style.display = "none";
    }

    showingFirst = !showingFirst;

});