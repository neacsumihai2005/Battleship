var board = []; ///holds the logic of the board
var hit = [];
var placedBoats = [];
var boardDiv = []; ///div of the board itself
var howManyPlayersReady;
var gx = [-1, -1, -1, 0, 0, 1, 1, 1];
var gy = [-1, 0, 1, -1, 1, -1, 0, 1];

var elementSize = 48;
var netElementSize = 50;
var boardRows = 10;
var boardColumns = 10;
var currentToShoot = 0;

function createTable(tableNumber){
    let boardDiv;
    boardDiv = document.createElement("div");
    if(tableNumber == 0){
        boardDiv.style.marginRight = "100px";
    }
    else if(tableNumber == 1){
        boardDiv.style.marginLeft = "100px";
    }

    boardDiv.classList.add("playerboard");
    boardDiv.style.height = (netElementSize * boardRows) + "px";
    boardDiv.style.width = (netElementSize * boardColumns) + "px";
    setTable(boardDiv, tableNumber);
    return boardDiv;
}

function RunGame(){
    document.getElementById("game").appendChild(createTable(0));
    let arrrowDiv;
    arrowDiv = document.createElement("div");
    arrowDiv.id = "arrow";
    arrowDiv.innerHTML = "<";

    document.getElementById("game").appendChild(arrowDiv);
    document.getElementById("game").appendChild(createTable(1));
    
    localStorage.setItem("player1board", board[0]);
    localStorage.setItem("player2board", board[1]);
    placedBoats[0] = 0;
    placedBoats[1] = 0;
    howManyPlayersReady = 0;
}

function setTable(boardDiv, tableNumber){
    board[tableNumber] = [];
    hit[tableNumber] = [];
    for(let i = 0; i < boardRows; i++){
        board[tableNumber][i] = [];
        hit[tableNumber][i] = [];
        for(let j = 0; j < boardColumns; j++){
            board[tableNumber][i][j] = 0;
            hit[tableNumber][i][j] = 0;
        }
    }

    for(let i = 0; i < boardRows; i++){
        for(let j = 0; j < boardColumns; j++){
            let tile = document.createElement("div");
            tile.setAttribute('ondrop', 'drop(event)');
            tile.setAttribute('ondragover', 'allowDrop(event)');
            tile.classList.add( tableNumber.toString() + "-" + i.toString() + "-" + j.toString() );
            tile.onclick = function() {shootTile(tile, tableNumber)};
            tile.style.height = elementSize + "px";
            tile.style.width = elementSize + "px";
            tile.classList.add("empty");
            boardDiv.appendChild(tile);
        }    
    }

    

    return boardDiv;
}

function checkLost(tableNumber){
    for(let i = 0; i < boardRows; i++){
        for(let j = 0; j < boardColumns; j++){
            if(board[tableNumber][i][j] == 1 && hit[tableNumber][i][j] == 0){
                return false;
            }
        }
    }

    return true;
}

function endGame(winner){
    currentToShoot = -1;
    document.getElementById("game").innerHTML = '';
    document.getElementById("game").innerText = "Player" + (1 + winner) + " won the game!";
}

function markDestroyedEmpty(x, y, tableNumber){
    if(x < 0){
        return;
    }
    if(y < 0){
        return;
    }
    if(x >= boardRows){
        return;
    }
    if(y >= boardColumns){
        return;
    }


    let hisClass = tableNumber.toString() + "-" + x.toString() + "-" + y.toString();
    let localTile = document.getElementsByClassName(hisClass)[0];
    if(!localTile.classList.contains("empty")){
        return;
    }
    
    localTile.classList.remove("empty");
    localTile.classList.add("empty-destroyed");
    
}

function shootTile(tile, tableNumber){
    if(howManyPlayersReady != 2){
        return;
    }
    if(!tile.classList.contains("empty")){
        return;
    }
    if(tableNumber != currentToShoot){
        return;
    }
    
    tile.classList.remove("empty");
    let boardNumber = tile.classList[0][0];
    let i = tile.classList[0][2];
    let j = tile.classList[0][4];
    hit[tableNumber][i][j] = 1;
    if(board[tableNumber][i][j] == 0){
        currentToShoot = 1 - currentToShoot;
        let arrowDiv = document.getElementById("arrow");
        if(arrowDiv.innerText == "<"){
            arrowDiv.innerText = ">";
        }
        else if(arrowDiv.innerText == ">"){
            arrowDiv.innerText = "<";
        }


        tile.classList.add("empty-destroyed");
    }
    else {
        tile.classList.add("nonempty-destroyed");
        tile.innerText = "X";

        //verify if whole boat is destroyed so we can mark the surroundings
        let direction;
        let st = parseInt(j) - 1;
        let dr = parseInt(j) + 1;
        let up = parseInt(i) - 1;
        let dn = parseInt(i) + 1;

        if( (st >= 0 && board[tableNumber][i][st] == 1) || (dr < boardColumns && board[tableNumber][i][dr] == 1)){
            direction = "horizontal";
        }
        else {
            direction = "vertical";
        }

        if(direction == "horizontal"){
            while(st >= 0 && board[tableNumber][i][st] == 1){
                st--;
            }
            while(dr < boardColumns && board[tableNumber][i][dr] == 1){
                dr++;
            }

            ///boat in interval:
            ///[i, st + 1], [i, dr - 1]
            let destroyed = true;
            for(let k = st + 1; k <= dr - 1; k++){
                if(hit[tableNumber][i][k] == 0){
                    destroyed = false;
                }
            }

            if(destroyed == true){
                ///mark if possible:
                ///[i - 1, st] to [i - 1], dr] horizontally
                ///[i, st] and [i, dr]
                ///[i + 1, st] to [i + 1, dr] horizontally
                markDestroyedEmpty(i, st, tableNumber);
                markDestroyedEmpty(i, dr, tableNumber);
                for(let k = st; k <= dr; k++){
                    let xn;
                    let yn;

                    xn = parseInt(i) - 1;
                    yn = k;
                    markDestroyedEmpty(xn, yn, tableNumber);

                    xn = parseInt(i) + 1;
                    yn = k;
                    markDestroyedEmpty(xn, yn, tableNumber);
                }
            }
        }
        else if(direction == "vertical"){
            while(up >= 0 && board[tableNumber][up][j] == 1){
                up--;
            }
            while(dn < boardRows && board[tableNumber][dn][j] == 1){
                dn++;
            }

            ///boat in interval:
            ///[up + 1, j], [dn - 1, j]
            let destroyed = true;
            for(let k = up + 1; k <= dn - 1; k++){
                if(hit[tableNumber][k][j] == 0){
                    destroyed = false;
                }
            }

            if(destroyed == true){
                ///mark if possible:
                ///[up, j - 1] to [dn, j - 1] vertically
                ///[up, j] and [dn, j]
                ///[up, j + 1] to [dn, j + 1] vertically
                markDestroyedEmpty(up, j, tableNumber);
                markDestroyedEmpty(dn, j, tableNumber);
                for(let k = up; k <= dn; k++){
                    let xn;
                    let yn;

                    xn = k;
                    yn = parseInt(j) - 1;
                    markDestroyedEmpty(xn, yn, tableNumber);

                    xn = k;
                    yn = parseInt(j) + 1;
                    markDestroyedEmpty(xn, yn, tableNumber);
                }
            }
        }
    }

    if( checkLost(tableNumber) == true ){
        let winner = 1 - tableNumber;
        endGame(winner);
    }
}



function allowDrop(event) {
    event.preventDefault();
}
function hasClassStartingWith(element, substring) {
    return Array.from(element.classList).some(className => className.startsWith(substring));
}
function drag(event){
    console.log("DRAG");

    let orientation;
    console.log("clase: " + event.target.parentNode.classList);
    if( hasClassStartingWith(event.target.parentNode, "horizontal") ){
        orientation = 'horizontal';
    }
    else {
        orientation = 'vertical';
    }


    let group = event.target.getAttribute('data-group');
    let siblings = document.querySelectorAll(`.group[data-group='${group}']`);
    let groupData = [];
    siblings.forEach(sibling => {
        groupData.push(sibling.innerHTML);
    });

    event.dataTransfer.setData("text", JSON.stringify({groupData, orientation}));

    if(event.target.parentNode.classList.contains("player1")){
        event.dataTransfer.setData("tableNumber", JSON.stringify(1));
    }else {
        event.dataTransfer.setData("tableNumber", JSON.stringify(2));
    }
    event.dataTransfer.setData("idDelete", JSON.stringify(group));
}

function drop(event){
    event.preventDefault();
    console.log("DROP");

    let data = event.dataTransfer.getData("text");
    let tableNumber = parseInt(event.dataTransfer.getData("tableNumber")) - 1;
    console.log("tableNumber = " + tableNumber);
    let idDelete = event.dataTransfer.getData("idDelete");
    let {groupData, orientation} = JSON.parse(data);
    

    if(!event.target.classList.contains('empty')){
        return;
    }
    if(event.target.classList[0][0] != tableNumber){
        /*console.log("Nu i place tabla!");
        console.log(event.target.classList[0][0]);
        console.log(tableNumber);*/
        return;
    }
    let index = Array.from(event.target.parentNode.children).indexOf(event.target);
    
    let x = event.target.classList[0][2];
    let y = event.target.classList[0][4];

    if (orientation === 'horizontal') {
        console.log("horizontal");
        
        ///check if you should proceed
        for (let i = 0; i < groupData.length; i++) {
            let targetIndex = index + i;
            if (targetIndex < event.target.parentNode.children.length) {
                let tablenumbern = event.target.parentNode.children[targetIndex].classList[0][0];
                let xn = event.target.parentNode.children[targetIndex].classList[0][2];
                let yn = event.target.parentNode.children[targetIndex].classList[0][4];
                if( ! (0 <= xn && xn <= boardRows - 1 && 0 <= yn && yn <= boardColumns - 1 && (xn == x || yn == y) ) ){   
                    return;
                }
                if(board[tablenumbern][xn][yn] == 1){
                    return;
                }
                ///or if an immediate neighbour is also marked

                for(let k = 0; k < 8; k++){
                    let xnn = parseInt(xn) + gx[k];
                    let ynn = parseInt(yn) + gy[k];
                    
                    if(0 <= xnn && xnn <= boardRows - 1 && 0 <= ynn && ynn <= boardColumns - 1 && board[tablenumbern][xnn][ynn] == 1){
                        return;
                    }

                }
            }
            else {
                return;
            }
        }

        ///mark the boat itself
        for (let i = 0; i < groupData.length; i++) {
            let targetIndex = index + i;
            if (targetIndex < event.target.parentNode.children.length) {
                event.target.parentNode.children[targetIndex].innerHTML = groupData[i];
                event.target.parentNode.children[targetIndex].classList.remove("empty");
                event.target.parentNode.children[targetIndex].classList.add("boat-occupied");
                let tablenumbern = event.target.parentNode.children[targetIndex].classList[0][0];
                let xn = event.target.parentNode.children[targetIndex].classList[0][2];
                let yn = event.target.parentNode.children[targetIndex].classList[0][4];
                
                
                board[tablenumbern][xn][yn] = 1;
            }
        }

        ///mark the neighbours
        for (let i = 0; i < groupData.length; i++) {
            let targetIndex = index + i;
            if (targetIndex < event.target.parentNode.children.length) {
                event.target.parentNode.children[targetIndex].innerHTML = groupData[i];
                event.target.parentNode.children[targetIndex].classList.remove("empty");
                event.target.parentNode.children[targetIndex].classList.add("boat-occupied");
                let tablenumbern = event.target.parentNode.children[targetIndex].classList[0][0];
                let xn = event.target.parentNode.children[targetIndex].classList[0][2];
                let yn = event.target.parentNode.children[targetIndex].classList[0][4];
                
                for(let k = 0; k < 8; k++){
                    let xnn = parseInt(xn) + gx[k];
                    let ynn = parseInt(yn) + gy[k];
                    
                    if(!(0 <= xnn && xnn <= boardRows - 1 && 0 <= ynn && ynn <= boardColumns - 1)){
                        continue;
                    }
                    if(board[tablenumbern][xnn][ynn] == 1){
                        continue;
                    }
                    let hisClass = tablenumbern + "-" + xnn + "-" + ynn;
                    console.log("hisClass = " + hisClass);
                    document.getElementsByClassName(hisClass)[0].classList.add("boat-vecinity");
                }
                
            }
        }

    }
    else if (orientation === 'vertical') {

        ///check if you should proceed
        for (let i = 0; i < groupData.length; i++) {
            let targetIndex = index + (i * event.target.parentNode.children.length / boardColumns);
            if (targetIndex < event.target.parentNode.children.length) {
                let tablenumbern = event.target.parentNode.children[targetIndex].classList[0][0];
                let xn = event.target.parentNode.children[targetIndex].classList[0][2];
                let yn = event.target.parentNode.children[targetIndex].classList[0][4];
                if( ! (0 <= xn && xn <= boardRows - 1 && 0 <= yn && yn <= boardColumns - 1 && (xn == x || yn == y) ) ){
                    return;
                }
                if(board[tablenumbern][xn][yn] == 1){
                    return;
                }
                ///or if an immediate neighbour is also marked

                for(let k = 0; k < 8; k++){
                    let xnn = parseInt(xn) + gx[k];
                    let ynn = parseInt(yn) + gy[k];
                    if(0 <= xnn && xnn <= boardRows - 1 && 0 <= ynn && ynn <= boardColumns - 1 && board[tablenumbern][xnn][ynn] == 1){
                        return;
                    }

                }
            }
            else {
                return;
            }
        }

        ///mark the boat itself
        for (let i = 0; i < groupData.length; i++) {
            let targetIndex = index + (i * event.target.parentNode.children.length / boardColumns);
            if (targetIndex < event.target.parentNode.children.length) {
                event.target.parentNode.children[targetIndex].innerHTML = groupData[i];
                event.target.parentNode.children[targetIndex].classList.remove("empty");
                event.target.parentNode.children[targetIndex].classList.add("boat-occupied");
                let tablenumbern = event.target.parentNode.children[targetIndex].classList[0][0];
                let xn = event.target.parentNode.children[targetIndex].classList[0][2];
                let yn = event.target.parentNode.children[targetIndex].classList[0][4];
                
                board[tablenumbern][xn][yn] = 1;
                
            }
        }

        
        ///mark the neighbours
        for (let i = 0; i < groupData.length; i++) {
            let targetIndex = index + (i * event.target.parentNode.children.length / boardColumns);
            if (targetIndex < event.target.parentNode.children.length) {
                event.target.parentNode.children[targetIndex].innerHTML = groupData[i];
                event.target.parentNode.children[targetIndex].classList.remove("empty");
                event.target.parentNode.children[targetIndex].classList.add("boat-occupied");
                let tablenumbern = event.target.parentNode.children[targetIndex].classList[0][0];
                let xn = event.target.parentNode.children[targetIndex].classList[0][2];
                let yn = event.target.parentNode.children[targetIndex].classList[0][4];
                
                for(let k = 0; k < 8; k++){
                    let xnn = parseInt(xn) + gx[k];
                    let ynn = parseInt(yn) + gy[k];
                    
                    if(!(0 <= xnn && xnn <= boardRows - 1 && 0 <= ynn && ynn <= boardColumns - 1)){
                        continue;
                    }
                    if(board[tablenumbern][xnn][ynn] == 1){
                        continue;
                    }
                    if(board[tablenumbern][xnn][ynn] == 1){
                        continue;
                    }
                    let hisClass = tablenumbern + "-" + xnn + "-" + ynn;
                    document.getElementsByClassName(hisClass)[0].classList.add("boat-vecinity");
                }
                
                
            }
        }
    }

    placedBoats[event.target.classList[0][0]] += 1;
    let playerNumber = parseInt(tableNumber) + 1;
    document.getElementById("boat" + idDelete[1] + "-" + playerNumber).remove();
}

function toggleOrientation(event) {
    // Get the parent div (horizontalDivs or verticalDivs)
    let parentDiv = event.currentTarget;

    // Toggle class between horizontalDivs and verticalDivs
    if (parentDiv.classList.contains('horizontalBoat1')) {
        parentDiv.classList.remove('horizontalBoat1');
        parentDiv.classList.add('verticalBoat1');
    } else if (parentDiv.classList.contains('verticalBoat1')) {
        parentDiv.classList.remove('verticalBoat1');
        parentDiv.classList.add('horizontalBoat1');
    }
    if (parentDiv.classList.contains('horizontalBoat2')) {
        parentDiv.classList.remove('horizontalBoat2');
        parentDiv.classList.add('verticalBoat2');
    } else if (parentDiv.classList.contains('verticalBoat2')) {
        parentDiv.classList.remove('verticalBoat2');
        parentDiv.classList.add('horizontalBoat2');
    }
    if (parentDiv.classList.contains('horizontalBoat3')) {
        parentDiv.classList.remove('horizontalBoat3');
        parentDiv.classList.add('verticalBoat3');
    } else if (parentDiv.classList.contains('verticalBoat3')) {
        parentDiv.classList.remove('verticalBoat3');
        parentDiv.classList.add('horizontalBoat3');
    }
    if (parentDiv.classList.contains('horizontalBoat4')) {
        parentDiv.classList.remove('horizontalBoat4');
        parentDiv.classList.add('verticalBoat4');
    } else if (parentDiv.classList.contains('verticalBoat4')) {
        parentDiv.classList.remove('verticalBoat4');
        parentDiv.classList.add('horizontalBoat4');
    }

}

function hideBoats(tableNumber){
    //first, check if all boats have been placed
    if(placedBoats[tableNumber] != 10){
        alert("Foloseste toate barcile!");
        return;
    }


    //then hide them all
    for(let i = 0; i < boardRows; i++){
        for(let j = 0; j < boardColumns; j++){
            let hisClass = tableNumber + "-" + i + "-" + j;

            let tile = document.getElementsByClassName(hisClass)[0];
            if(tile.classList.contains("boat-occupied")){
                tile.classList.remove("boat-occupied");
                tile.classList.add("empty");
            }
            if(tile.classList.contains("boat-vecinity")){
                tile.classList.remove("boat-vecinity");
                tile.classList.add("empty");
            }
            //tile.style.backgroundColor = "#83838a";
            tile.innerHTML = "";
        }
    }

    document.getElementById("readyplayer" + (parseInt(tableNumber) + 1)).remove();
    howManyPlayersReady += 1;
    if(howManyPlayersReady == 2){
        document.getElementsByClassName("menus-container")[0].remove();
    }

}


RunGame();
