/*
	Robert Cox and Artem Vityuk
	03/21/2019
	Filename: IT207FinalProjectJS.js
	for url: http://rcox.greenriverdev.com/207/finalProject/IT207FinalProjectHTML.html
	Final Project for IT207 GRC WINTER19
	This file uses a form to ask you to choose a drink from choices given and based on the choice
	it picks an image and it takes you to a game where you have to find a part of that image
*/

// Grab the form and the inputs
var form = document.getElementById('drink-form');
var fName;
var errFName;
var drinks = document.getElementsByName('drinkChoice');
var flavors ;
var thisFlavor;
// create div and button to be dispayed later
var newDiv = document.createElement('div');
var button = document.createElement('button');
button.setAttribute('id', 'myButton');
button.innerHTML = 'Play';
//Access more document elements
var form = document.getElementById('form');
//creating new canvas
var base = document.getElementById("base");
var game = document.createElement("canvas");
//the drawing apparatus for each canvas
var baseCtx = base.getContext("2d");
var ctx = game.getContext("2d");
//set gradients and fonts
var baseGrad;
var baseGrad2;
var fontStyle = 'px Arial Black';
var fontColor = 'rgb(255, 200, 0)';
//getting the image used for the game, this is just for JSON demonstration purposes
var img = new Image();
var fileName;
var source;
//for the random image and target area
var randGoalImage = {x:0, y:0, w:0, h:0};
var randRow;
var randColumn;
//hit this to win the game
var target = {x:0, y:0, x2:0, y2:0};
//x and y offsets, set with newGame()
var xOff;
var yOff;
//game box bounding, set with newGame()
var boundX;
var boundY;
var boundX2;
var boundY2;
//goal image box, set with newGame()
var goalBoxX;
var goalBoxY;
var goalBoxW;
var goalBoxH;
//mouse offsets, set upon mouse movement
var mxOff;
var myOff;
//set in newGame(), values based on screen dimensions
var holeRadius;
var wideScreen;
var findFont;
//game counters
var attempts;
var seconds;
var startInterval;
var winner = false;

//add function to drink choices
for(var i = 0; i < drinks.length; i++)
{
    drinks[i].onclick = test;
}
//initialize game settings
newGame();

// functions checks to see which radio button was clicked
// and based of that calls other functions
function test()
{
    if(form.contains(button))
    {
        console.log('triggered');
        form.removeChild(button);
    }
    
    if(this.id == 'coke')
    {
        ifCoke();
    }
    else if(this.id == 'pepsi')
    {
        ifPepsi();
    }
    else
    {
        ifFanta();
    }
}
// executes when user chooses coca-cola
function ifCoke()
{
    // add the needed inputs and append to the form
    newDiv.innerHTML = "<h3>Choose your Coke flavor</h3>" +
        "<label><input type='radio' id='coke-regular' name='coke-flavors'> Regular</label><br>" +
        "<label><input type='radio' id='coke-vanilla' name='coke-flavors'> Vanilla</label><br>" +
        "<label><input type='radio' id='coke-cherry' name='coke-flavors'> Cherry</label><br>"+
        "<label><input type='radio' id='coke-lime' name='coke-flavors'> Lime</label><br>"+
        "<label><input type='radio' id='coke-lemon' name='coke-flavors'> Lemon</label><br><br>";
    form.appendChild(newDiv);
	//list of flavors
    flavors = document.getElementsByName('coke-flavors');
    //add function to flavors
    for(var i = 0; i < flavors.length; i++)
    {
        flavors[i].addEventListener('click', newFlavor);
    }
}
// executes when user chooses pepsi
function ifPepsi()
{
    // add the needed inputs and append to the form
    newDiv.innerHTML = "<h3>Choose your Pepsi flavor</h3>" +
        "<label><input type='radio' id='pepsi-regular' name='pepsi-flavors'> Regular</label><br>" +
        "<label><input type='radio' id='pepsi-cherry' name='pepsi-flavors'> Cherry</label><br>" +
        "<label><input type='radio' id='pepsi-lime' name='pepsi-flavors'> Lime</label><br><br>";
            
    form.appendChild(newDiv);
	
	flavors = document.getElementsByName('pepsi-flavors');
    
    for(var i = 0; i < flavors.length; i++)
    {
        flavors[i].addEventListener('click', newFlavor);
    }
}
// executes when user chooses fanta
function ifFanta()
{
    // add the needed inputs and append to the form
    newDiv.innerHTML = "<h3>Choose your fanta flavor</h3>" +
        "<label><input type='radio' id='fanta-orange' name='fanta-flavors'> Orange</label><br>" +
        "<label><input type='radio' id='fanta-strawberry' name='fanta-flavors'> Strawberry</label><br><br>";
    form.appendChild(newDiv);
	
	flavors = document.getElementsByName('fanta-flavors');
    
    for(var i = 0; i < flavors.length; i++)
    {
		flavors[i].addEventListener('click', newFlavor);
    }
}
//gets the players drink and uses that to get game image
function newFlavor()
{
    thisFlavor = this.id;
    console.log(thisFlavor);
	//image filenames stored in a json file, this is purely for json demo purposes
	$.getJSON('imageFileNames.json', function(data)
    {
        for(var i = 0; i< data.length; i++)
        {
            //keys match radio input id's 
            if(data[i].key == thisFlavor)
            {
                fileName = data[i].value;
                source = 'images/' + fileName;
                img.src = source;
            }
        }
        playReady();
    });
}
//play button starts the game
function playReady()
{
	form.appendChild(button);
	button.addEventListener('click',function()
    {
        //ready screen for the game (empties the #form div)
        fName = document.getElementById('fname').value;
        errFName = document.getElementById('error-fname');
        //if form first name has been set
        if(validate())
        {
            //'puff' animation to remove the form before game start (jquery UI demo only)
            $('#form').toggle( "puff" );
            //handling a window resize event
            window.addEventListener('resize', function()
                                    {
                                        if(winner)
                                        {
                                            base.removeEventListener('click', playAgain);
                                        }
                                        buildGame();
                                    });
            //just what it says
            buildGame();  //builds the game
            addMyInterval(); //start game timer
        }
    });
}
//validates form completion
function validate()
{
	if(fName === '')
	{
        //shake effect on input and error message revealed
        $('#fname').effect('shake');
		errFName.className = 'error';
		return false;
	}
	else
	{
		return true;
	}
}
//set this game's unique row/column (for target and randGoalImage), resets counters
function newGame()
{
	//new random row and column for target and goal image
	randRow = Math.floor(Math.random()*10);
	randColumn = Math.floor(Math.random()*10);
	//resets 
	attempts = 0;
	seconds = 0;
}
//builds game based on window dimensions
function buildGame() {
    //fit canvas to window
    base.width = window.innerWidth;
    base.height = window.innerHeight;
    //game box size 70% of the base canvas (window).
    game.width = base.width * 0.7;
    game.height = base.height * 0.7;
    //set gradients
    baseGrad = baseCtx.createLinearGradient(0, 0, base.width, base.height);
    baseGrad2 = baseCtx.createLinearGradient(0, 0, game.height, game.height);
    baseGrad.addColorStop(0, "rgb(22, 223, 123)");
    baseGrad.addColorStop(1, "rgb(12, 107, 247)");
    baseGrad2.addColorStop(0, "rgb(12, 107, 247)");
    baseGrad2.addColorStop(1, "rgb(22, 223, 123)");
    //x and y offsets of 5%, used in game box position and peep-hole size
    xOff = base.width * 0.05;
    yOff = base.height * 0.05;
    //game box bounding/positioning
    boundX = xOff;
    boundY = yOff;
    boundX2 = xOff + game.width;
    boundY2 = yOff + game.height;
    //goal image box
    goalBoxX = boundX2 + (base.width * 0.02);
    goalBoxY = yOff;
    goalBoxW = base.width * 0.2;
    goalBoxH = base.height * 0.2;

    //hole radius is based off the smaller of the screen's dimensions
    if(base.width <= base.height)
    {
        holeRadius = xOff;
        findFont = xOff;
    }
    else
    {
        holeRadius = yOff;
        wideScreen = true;
        findFont = yOff;
    }
    //just what they sy
    generateGoalImage();
    generateTarget();
    //parameters for drawGameBoard(x, y) just position the peep-hole,
    //no offsets necessary as arcs are positioned by its center
    drawGameBoard(game.width/2, game.height/2);
    drawBase();
    //with these new areas drawn we can now listen for events
    base.addEventListener('mousemove', holeMove);
    base.addEventListener('click', clickResult);
}
//Did you hit the target?
function clickResult(event)
{
    //getting the 'click' position
    let mx = event.pageX;
    let my = event.pageY;
    //is the click in the target? yes: initialize win display
    if(inTarget(mx, my))
    {
        //still get charged for the attempt
        attempts++;
        //remove game event listeners and stop the timer
        base.removeEventListener('mousemove', holeMove);
        base.removeEventListener('click', clickResult);
        clearInterval(startInterval);
        //give the cursor back
        base.style.cursor = 'auto';
        //draw winner screen
        drawWinner();
        //listen for play again event
        base.addEventListener('click', playAgain);
        winner = true;
    }
    //if the click was in the gamebox (and not in the target)
    else if(inGameBox(mx, my))
    {
        //add the attempt
        attempts++;
        //"Try Again" on screen
        baseCtx.font = findFont + "px Comic Sans MS";
        baseCtx.fillStyle = "red";
        baseCtx.textAlign = "center";
        baseCtx.fillText("Keep Trying!", (base.width/2)-(xOff/2), base.height -(yOff + 2));
    }
}
//winner screen
function drawWinner()
{
    //draw winner screen
    baseCtx.fillStyle = 'green';
    baseCtx.fillRect(base.width * 0.25, base.height * 0.5, base.width * 0.2, base.height * 0.2);
    baseCtx.fillStyle = 'red';
    baseCtx.fillRect(base.width * 0.5, base.height * 0.5, base.width * 0.2, base.height * 0.2);
    //winner text
    baseCtx.font = (findFont*2) + fontStyle;
    baseCtx.fillStyle = fontColor;
    baseCtx.textAlign = "center";
    baseCtx.fillText(fName + " is a Winner!", (base.width/2)-(xOff/2), base.height/2 -(yOff + 2));
    baseCtx.font = findFont + fontStyle;
    baseCtx.fillText('Again', ((base.width*0.25) + (base.width * 0.2)/2), (base.height * 0.5) + ((base.height * 0.2)/2));
    baseCtx.fillText('Attempts: ' + attempts + ', Seconds: ' + seconds, (base.width/2)-(xOff/2), base.height -(yOff + 2));
    baseCtx.fillText('Exit', ((base.width*0.5) + (base.width * 0.2)/2), (base.height * 0.5) + ((base.height * 0.2)/2));
}
//sets the properties of the randGoalImage, 1/10 the image size at a random row and column
function generateGoalImage()
{
    randGoalImage.x = (img.width/10) * randRow;
    randGoalImage.y = (img.height/10) * randColumn;
    randGoalImage.w = img.width/10;
    randGoalImage.h = img.height/10;
}
//same as generateGoalImage() but on the game area
function generateTarget()
{
    target.x = xOff + ((game.width/10) * randRow);
    target.y = yOff + ((game.height/10) * randColumn);
    target.x2 = target.x + (game.width/10);
    target.y2 = target.y + (game.height/10);
}
//draws the game board with the peep-hole at x, y
function drawGameBoard(x, y)
{
    ctx.drawImage(img, 0, 0, game.width, game.height);
    ctx.globalCompositeOperation='destination-atop';
    ctx.beginPath();
    ctx.arc(x, y, holeRadius, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
}
//base, onto which everything is drawn
function drawBase()
{
    //entire base with blue fill
    baseCtx.fillStyle = baseGrad;
    baseCtx.fillRect(0, 0, base.width, base.height);
    //game area with white fill
    baseCtx.globalCompositeOperation = 'source-over';
    baseCtx.fillStyle = baseGrad2;
    baseCtx.fillRect(xOff, yOff, game.width, game.height);
    //draw the goal image area (top right)
    baseCtx.globalCompositeOperation = 'source-over';
    baseCtx.drawImage(img, randGoalImage.x, randGoalImage.y, randGoalImage.w, randGoalImage.h, goalBoxX, goalBoxY, goalBoxW, goalBoxH);
    baseCtx.font = findFont + fontStyle;
    baseCtx.fillStyle = fontColor;
    baseCtx.textAlign = 'start';
    baseCtx.fillText('Find Me!', goalBoxX, goalBoxY+goalBoxH+(base.height * 0.05));
    baseCtx.fillText('Click Me!', goalBoxX, goalBoxY+goalBoxH+(base.height * 0.1));
    baseCtx.font = (findFont*4) + fontStyle;
    baseCtx.textAlign = 'center';
    baseCtx.fillText(seconds, goalBoxX+(goalBoxW/2), goalBoxY+goalBoxH+(base.height * 0.4));
    //draw the game onto the base
    baseCtx.globalCompositeOperation = 'source-over';
    baseCtx.drawImage(game, xOff, yOff);
}
//used to match mouse and peep-hole
function setMouseOffsets(x, y)
{
    mxOff = x - xOff;
    myOff = y - yOff;
}
//moves the peep-hole, triggered by mouse-movement on the page
function holeMove(event)
{
    //get position of the mouse move
    let mx = event.pageX;
    let my = event.pageY;
    //is the mouse moving in the game box? yes...
    if(inGameBox(mx, my))
    {
        //remove cursor
        base.style.cursor = 'none';
        //offsets...I'm tellin' ya...they'll getcha everytime
        setMouseOffsets(mx, my);
        //clear canvases for redraw
        ctx.clearRect(0,0,game.width, game.height);
        baseCtx.clearRect(0,0,base.width,base.height);
        //redraw with the mouse position(+offsets) setting the peep-hole position
        drawGameBoard(mxOff, myOff);
        drawBase();
    }
    else
    {
        //mouse not over game box, return cursor
        base.style.cursor = 'auto';
    }
}
//checks whether the provided x and y (mouse position) are in the game bounding box
function inGameBox(x, y)
{
    if(x > boundX &&
        x < boundX2 &&
        y > boundY &&
        y < boundY2)
    {
        return true;
    }
    else
    {
        return false;
    }
}
//checks whether the provided x and y (mouse position) are in the target bounding box
function inTarget(x, y)
{
    if(x > target.x &&
        x < target.x2 &&
        y > target.y &&
        y < target.y2)
    {
        return true;
    }
    else
    {
        return false;
    }
}
//activates when player wins, waiting for a click on the winner screen
function playAgain(event)
{
    //get the click position
    let mx = event.pageX;
    let my = event.pageY;
    //is the click in the again box? yes: initialize new game
    if(inPlayAgain(mx, my))
    {
        base.removeEventListener('click', playAgain);
        newGame();
        buildGame();
        addMyInterval();
    }
    //no: is it in the exit box? yes: refresh the page
    else if(inExit(mx, my))
    {
        location.reload(true);
    }
}
//was the click in the exit box?
function inExit(x, y)
{
    if(x > base.width * 0.5 &&
        y > base.height * 0.5 &&
        x < (base.width * 0.5) + (base.width * 0.2) &&
        y < (base.height * 0.5) + (base.height * 0.2))
    {
        return true;
    }
    else
    {
        return false;
    }
}
//was the click in the again box?
function inPlayAgain(x, y)
{
    if(x > base.width * 0.25 &&
        y > base.height * 0.5 &&
        x < (base.width * 0.25) + (base.width * 0.2) &&
        y < (base.height * 0.5) + (base.height * 0.2))
    {
        return true;
    }
    else
    {
        return false;
    }
}
//counts seconds upon new game build
function addMyInterval()
{
    startInterval = setInterval(function ()
    {
        seconds++;
        drawBase();
    }, 1000);
}