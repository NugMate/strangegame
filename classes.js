var PLAYER = 1;
var WALL = 2;
var COIN_SPAWN = 3;
var TRAP = 4;
var SMOKE = 5;
var EXIT = 6;
var ENEMY = 7;
var ENEMIES_SPAWN = 8;
var USER_SPAWN = 9;
var SHINY_ENEMY = 10;
var TORCH = 11;

class Map{
	constructor(maparray,inventory,hp,bonus){
		this.staticLayer=[];
		this.itemsLayer=[];
		this.enemiesLayer=[];
		this.enemies=[];
		this.shinyenemy=[];
		this.lengthy = maparray.length;
		this.lengthx = maparray[0].length;
		this.coins=0;
		this.exit = {x:null,y:null};
		for (var y=0; y < maparray.length; y++){	
			this.enemiesLayer.push([]);
			this.staticLayer.push([]);
			this.itemsLayer.push([]);
			for(var x=0; x < maparray[y].length; x++){
				if (maparray[y][x] == USER_SPAWN){
					this.enemiesLayer[y][x]=PLAYER;
					this.staticLayer[y][x]=USER_SPAWN;
					this.exit.x = x;
					this.exit.y = y;
					this.user = new User(x,y,inventory,hp,bonus);
				} else if (maparray[y][x] == ENEMIES_SPAWN){
					this.enemiesLayer[y][x]=ENEMY;
					this.staticLayer[y][x]=ENEMIES_SPAWN;
					this.enemies.push(new Enemy(x,y));
				} else if (maparray[y][x] == COIN_SPAWN){
					this.itemsLayer[y][x]=COIN_SPAWN;
					this.coins++;
					this.staticLayer[y][x] = 0;
				} else if (maparray[y][x] == WALL){
					this.staticLayer[y][x]=WALL;
				} else {
					this.staticLayer[y][x] = 0;
				}
			}
		}
	}
	playerGetDamage(){
		for(var i=this.user.hp.length;i>=0;i--){
			if(this.user.hp[i] == 1){
				this.user.hp[i] = 0;
				this.user.radius = 3;
				if(this.user.hp[0] == 0){
					this.user.statuss = 0;
					alert("You lose")
				}
				return
			}
		}
	}

	getVisibleCells(coordinates){
		var visitedCells = [], cellsToCheck=[], curentStepCells=[coordinates];
		for(var i=0;i<this.user.radius;i++){
			for(var g=0;g<curentStepCells.length;g++){
				var curent = curentStepCells[g];
				var isVisited = visitedCells.find(function(cell){return(cell.x==curent.x && cell.y==curent.y)})
				if(this.insideBorder(curent.x,curent.y) && isVisited==undefined){
					visitedCells.push(curent);
				}
				if(this.canStep(curent.x,curent.y) && isVisited==undefined){
					cellsToCheck.push({x:curent.x+1,y:curent.y});
					cellsToCheck.push({x:curent.x-1,y:curent.y});
					cellsToCheck.push({x:curent.x,y:curent.y+1});
					cellsToCheck.push({x:curent.x,y:curent.y-1});
				}
				debugger
				if(this.getShinyEnemy(curent.x,curent.y)){
					cellsToCheck.push({x:curent.x,y:curent.y})
				}
			}
			curentStepCells=cellsToCheck;
			cellsToCheck=[];
		}
		return(visitedCells)
	}
	catchEnemy(x,y){
		this.enemiesLayer[y][x] = SHINY_ENEMY;
		if(this.getEnemy(x,y).item == 0){
			this.getEnemy(x,y).item = 1;
		}
	}
	removeItem(x,y){
		this.itemsLayer[y][x] = undefined;
	}
	removeEnemy(x,y){
		this.enemiesLayer[y][x] = undefined;
		var newenemies =[];
		for(var i=0;i<this.enemies.length;i++){
			if(this.enemies[i] != this.getEnemy(x,y)){
				newenemies.push(this.enemies[i])
			} 
		}
		this.enemies = newenemies;	
	}
	destroyTorch(x,y){
		this.itemsLayer[y][x] = undefined;
	}
	enemyDie(x,y){
		if(this.user.inventoryStatus()){
			return(alert("Your inventory is full"))
		} else {
			if(this.getEnemy(x,y).item == 1){
				this.user.inventory[this.user.getInventorySlot()] = TRAP;
			}else if(this.getEnemy(x,y).item == 2){
				this.user.bonus = TORCH;
				this.user.radius=4;	
			}
		}
	}
	removeTrap(x,y){
		this.itemsLayer[y][x] = undefined;
	}
	setItem(x,y){
		if(this.user.inventory[0] == TRAP){
			this.itemsLayer[y][x] = TRAP;
			this.user.inventory.shift()
		} else{
			alert("Your inventory is empty")
		}
	}

	canExit(){
		if (this.user.coins == this.coins){
			this.itemsLayer[this.exit.y][this.exit.x] = EXIT;
		}
	}

	canStep(x,y){
		return (this.insideBorder(x,y) && this.staticLayer[y][x]!=WALL && this.user.statuss == 1)
	}
	insideBorder(x,y){
		return(x>=0 && x<this.lengthx && y>=0 && y<this.lengthy)
	}
	getEnemy(x,y){
		for(var i=0;i<this.enemies.length;i++){
			if(x == this.enemies[i].x && y == this.enemies[i].y){
				return(this.enemies[i])
			}
		}
	}
	getShinyEnemy(x,y){
		return(this.enemiesLayer[y][x] == SHINY_ENEMY)
	}
	getTorch(x,y){
		return(this.itemsLayer[y][x] == TORCH)
	}
	getCoin(x,y){
		return(this.itemsLayer[y][x] == COIN_SPAWN)
	}
	getPlayer(x,y){
		return(this.enemiesLayer[y][x] == PLAYER)
	}
	getExit(x,y){
		return(this.itemsLayer[y][x] == EXIT)
	}
	getTrap(x,y){
		return(this.itemsLayer[y][x] == TRAP)
	}

	getCell(x,y){
		var visibleCells = this.getVisibleCells({x:this.user.x,y:this.user.y});
		for(var i=0; i<visibleCells.length; i++){
			if (x==visibleCells[i].x && y==visibleCells[i].y){
				return (this.enemiesLayer[y][x] || this.itemsLayer[y][x] || this.staticLayer[y][x])
			} 	
		}
		return(SMOKE)
	}
	getItemName(i){
		if (this.user.inventory[i] == TRAP){
			return("trap")
		} else {
			return("empty")
		}
	}

	moveLiving(oldposition,newposition,layer){
			layer[newposition.y][newposition.x] = layer[oldposition.y][oldposition.x];
			layer[oldposition.y][oldposition.x] = undefined;
	}
}
class Drawer{
	constructor(map){
		this.map = map
	}
	drawLevel(){
		var body = '<table class="m"><tbody>';
		for(var y=0;y < this.map.lengthy; y++){
			body += '<tr>';
			for (var x=0; x < this.map.lengthx; x++){
					body += '<td class="cell'+ this.map.getCell(x,y) +'"></td>';
			}
			body += "</tr>";
		}
		document.getElementById('divid').innerHTML = body + '</tbody></table>';
		this.coinsCount();
		this.drawInventory();
		this.drawHP();
		this.drawBonuses();
	}
	drawInventory(){
		var body = '<table class="m"><tbody><tr>';
		for(var i=0;i < this.map.user.inventorylength; i++){
			body += '<td class="inventory'+ this.map.user.inventory[i] +'">'+ this.map.getItemName(i) +'</td>';
		}
		document.getElementById('inventory').innerHTML = body + '</tr></tbody></table>';
	}
	drawBonuses(){
		var body = '<table><tbody><tr>';
		body += "<td class='cell"+this.map.user.bonus+"'>";
		document.getElementById('bonuses').innerHTML = body + '</td></tr></tbody></table>';

	}
	drawHP(){
		var body = '<table class="hp"><tbody><tr>';
		for(var i=0;i<this.map.user.hp.length;i++){
			body += '<td class="hp'+ this.map.user.hp[i] +'"></td>';
		}
		document.getElementById('hp').innerHTML = body + '</tr></tbody></tdble>';
	}
	coinsCount(){
		if(this.map.user.coins < this.map.coins){
			document.getElementById('coins').innerHTML = this.map.user.coins + '/'+ this.map.coins;
		} else {
			document.getElementById('coins').innerHTML = "Find the EXIT"
		}
	}
	firstMenu(){
		document.getElementById('divid').innerHTML ="<p><button onclick='window.game = new Game(1)'>Быстрая игра</button></p><p><button onclick='window.menu = new Game(5)'>Выбор уровня</button></p>"
	}
	secondMenu(){
		document.getElementById('divid').innerHTML ="<p><button onclick='window.game = new Game(1)'>1 Уровень</button></p><p><button onclick='window.game = new Game(2)'>2 Уровень</button></p><p><button onclick='window.game = new Game(3)'>3 Уровень</button></p><p><button onclick='window.game = new Game(4)'>Назад</button></p>"
	}	
}

class Enemy{
	constructor(x,y){
		this.x = x;
		this.y = y;
		this.item = Math.floor(Math.random()*4);
	}
	step(x,y){
		this.x = x;
		this.y = y;
	}
	
}

class User{
	constructor(x,y,inventory,hp,bonus){
		this.x = x;
		this.y = y;
		this.coins = 0;
		this.statuss = 1;
		this.inventorylength = 10;
		this.radius = 3;
		this.bonus = bonus;
		if(inventory == undefined){
			this.inventory = [TRAP,TRAP];
		} else {
		this.inventory = inventory;
		}
		if(hp == undefined){
			this.hp = [1,1];
		} else {
			this.hp = hp;
		}
	}
	step(x,y){
		this.x = x;
		this.y = y;
	}
	collectCoin(){
		this.coins++
	}
	getInventorySlot(){
		for(var i=0;i<this.inventorylength;i++){
			if(this.inventory[i] == undefined){
				return(i)
			}
		}
	}
	inventoryStatus(){
		return(this.inventory.length == this.inventorylength)
	}
}

class Game{
	constructor(button,inventory,hp,bonus){
		if(button == 1){
			this.gamelevel = 1;
			this.map = new Map(matrix1,inventory,hp,bonus);
			this.drawer = new Drawer(this.map);
			this.drawer.drawLevel();
		} else if(button == 5){
			this.drawer = new Drawer();
			this.drawer.secondMenu();
		} else if(button == 2){
			this.gamelevel = 2;
			this.map = new Map(matrix2,inventory,hp,bonus);
			this.drawer = new Drawer(this.map);
			this.drawer.drawLevel();
		} else if(button == 4){
			this.drawer = new Drawer();
			this.drawer.firstMenu();
		} else if(button == 3){
			this.gamelevel = 3;
			this.map = new Map(matrix3,inventory,hp,bonus);
			this.drawer = new Drawer(this.map);
			this.drawer.drawLevel();
		}
	}

	PlayerStep(event){
		var x= this.map.user.x, y= this.map.user.y;
		if(event.charCode == 119){
			y -= 1;
		} else if (event.charCode == 97) {
			x -= 1;
		} else if (event.charCode == 115) {
			y += 1;
		} else if (event.charCode == 100) {
			x += 1;
		} else if(event.charCode == 102) {
			this.map.setItem(x,y);
			this.drawer.drawInventory();
			return
		} else {
			return
		}
		if(this.map.canStep(x,y)){
			var enemy = this.map.getEnemy(x,y),
			coin = this.map.getCoin(x,y),
			exit = this.map.getExit(x,y),
			torch = this.map.getTorch(x,y);
			if(enemy){
				this.map.enemyDie(x,y);
				this.map.removeEnemy(x,y);
			} else if (coin){
				this.map.removeItem(x,y);
				this.map.user.collectCoin();
				this.drawer.coinsCount();
				this.map.canExit()
			} else if(exit){
				alert("You win");
				this.map.user.statuss = 2;
			}
			this.map.moveLiving({x:this.map.user.x, y:this.map.user.y},{x:x, y:y},this.map.enemiesLayer);
			this.map.user.step(x,y);
			this.EnemyStep();
			this.drawer.drawLevel();
			if(this.map.user.statuss == 2){
				if(this.gamelevel == 1){
					window.game = new Game(2,window.game.map.user.inventory,window.game.map.user.hp,window.game.map.user.bonus);
				} else if(this.gamelevel == 2){
					window.game = new Game(3,window.game.map.user.inventory,window.game.map.user.hp,window.game.map.user.bonus);
				} else if(this.gamelevel == 3){
					window.game = new Game(1,window.game.map.user.inventory,window.game.map.user.hp,window.game.map.user.bonus);
				}
			} else if(this.map.user.statuss==0){
				window.game = new Game(this.gamelevel);
			}
		}
	}
	EnemyStep(){
		for(var i=0;i<this.map.enemies.length;i++){
			var x = this.map.enemies[i].x, y = this.map.enemies[i].y;
			var movement = Math.floor(Math.random()*4);
			if (movement == 0){
				y -= 1;
			} else if (movement == 1){
				x -= 1;
			} else if (movement == 2){
				y += 1;
			} else if (movement == 3){
				x += 1;
			} else {
				return
			}
			if(this.map.canStep(x,y) && !this.map.getEnemy(x,y)){
				var player=this.map.getPlayer(x,y), trap = this.map.getTrap(x,y);
				if(player){
					this.map.playerGetDamage()
					this.map.enemyDie(this.map.enemies[i].x,this.map.enemies[i].y);
					this.map.removeEnemy(this.map.enemies[i].x,this.map.enemies[i].y);
					return
				} else if(trap){
					this.map.catchEnemy(this.map.enemies[i].x,this.map.enemies[i].y);
					this.map.removeTrap(x,y);
				}
				this.map.moveLiving({x:this.map.enemies[i].x, y:this.map.enemies[i].y},{x:x, y:y},this.map.enemiesLayer);
				this.map.enemies[i].step(x,y);
			}
		}
	}
}