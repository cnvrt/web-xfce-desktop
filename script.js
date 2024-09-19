// init global vars
var taskbarProg = document.getElementsByClassName("taskbar-program");
var mainDesktop = document.getElementsByClassName("main-desktop")[0];
var openWindow = document.getElementsByClassName("open-window");

// Change active window/open-program/deactivate window  -- Also make a window active when taskbar name is clicked
for (i = 1; i < taskbarProg.length; i++) {
  taskbarProg[i].addEventListener("click", openProgram);
}

function openProgram() {
  if (this.classList.contains("open-program")) {
    this.classList.remove("open-program");

    // deactivate window
    for (i = 0; i < openWindow.length; i++) {
      if (
        this.getAttribute("data-window") ==
        openWindow[i].getAttribute("data-window")
      ) {
        if (openWindow[i].classList.contains("active-window")) {
          openWindow[i].classList.remove("active-window");
          openWindow[i].classList.add("minimized-window");
          break;
        }
      }
    }
  } else {
  closeProgram();
    this.classList.add("open-program");

    // activate window when clicked on corresponding taskbar name
    for (i = 0; i < openWindow.length; i++) {
      if (
        this.getAttribute("data-window") ==
        openWindow[i].getAttribute("data-window")
      ) {
        if (!openWindow[i].classList.contains("active-window")) {
          openWindow[i].classList.add("active-window");
          if (openWindow[i].classList.contains("minimized-window")) {
            openWindow[i].classList.remove("minimized-window");
            break;
          } else {
            break;
          }
        }
      }
    }
  }
}

// Deactivate programs when clicked on desktop
mainDesktop.addEventListener("click", closeProgram);

function closeProgram() {
  for (i = 1; i < taskbarProg.length; i++) {
    if (taskbarProg[i].classList.contains("open-program")) {
      taskbarProg[i].classList.remove("open-program");
    }
  }

  var openWindow = document.getElementsByClassName("open-window");
  for (f = 0; f < openWindow.length; f++) {
    if (openWindow[f].classList.contains("active-window")) {
      openWindow[f].classList.remove("active-window");
    }
  }
}


var updateTime = setInterval(timeUpdate, 1000);

function timeUpdate() {
  var date = new Date(Date.now());
   $('.time').text(date.toLocaleString(navigator.language, {
    hour: '2-digit',
    minute: '2-digit'
  })).attr('datetime', date.getHours() + ':' + date.getMinutes());
}

//Must use JQuery
$(".open-window").bind("click", activeWindow);
function activeWindow() {
  var $this = $(this);
  // console.log("-1-", this);
  closeProgram();
  
      /*$(".open-window").not(this).each(function (index, this1) {
        // console.log(index+"-", this1);
        this1.classList.remove("active-window");
      });*/

  if (!$this.hasClass("active-window")) {
    if ($this.hasClass("minimized-window")) {
      $this.removeClass("active-window");
    } else {
      $this.addClass("active-window");

      // activate corresponding taskbar icon
      for (var i = 1; i < taskbarProg.length; i++) {
        var $taskbarItem = $(taskbarProg[i]);
        // console.log(i, $this[0], $this.data("window")+"-"+$taskbarItem.data("window"));
        if ($this.data("window") === $taskbarItem.data("window")) {
          // console.log(i, "this");
          if (!$this.hasClass("minimized-window")) {
            if (!$taskbarItem.hasClass("open-program")) {
              $taskbarItem.addClass("open-program");
              break;
            }
          }
        }
      }
    }
  }
}


// close window
var getClose = document.getElementsByClassName("fa-close");

for (o = 0; o < getClose.length; o++) {
  getClose[o].addEventListener("click", closeWindow);
}

function closeWindow() {
  var data = this.parentElement.parentElement.getAttribute("data-window");
  var theCurrent = this.parentElement.parentElement;

  for (i = 1; i < taskbarProg.length; i++) {
    if (taskbarProg[i].getAttribute("data-window") == data) {
      theCurrent.remove();
      taskbarProg[i].remove();
      break;
    }
  }
}

// hide/unhide menu
var theMenu = document.getElementsByClassName("menu")[0];
var desktop = document.getElementsByClassName("desktop")[0];

desktop.addEventListener("click", function() {
  var getSub = document.getElementsByClassName("menu-dropdown")[0];
  if (!getSub.classList.contains("menu-dropdown-hide")) {
    getSub.classList.add("menu-dropdown-hide");
    taskbarProg[0].classList.remove("active-menu");
  }
});

theMenu.addEventListener("click", function() {
  var getSub = document.getElementsByClassName("menu-dropdown")[0];
  // console.log(this, getSub);
  $('#terminal').on("click", function(){
    // console.log('#terminal', this);
    openIcon(this);
  });

  if (!getSub.classList.contains("menu-dropdown-hide")) {
    getSub.classList.add("menu-dropdown-hide");
    theMenu.classList.remove("active-menu");
  } else {
    getSub.classList.remove("menu-dropdown-hide");
    theMenu.classList.add("active-menu");
  }
});

// maximize window
var maxBtn = document.getElementsByClassName("fa-window-maximize");

for (x = 0; x < maxBtn.length; x++) {
  maxBtn[x].addEventListener("click", maxWindow);
}

function maxWindow() {
  var theParent = this.parentElement.parentElement;
  var theHeight = window.innerHeight - 30;

  if (!theParent.classList.contains("window-maximized")) {
    theParent.classList.add("window-maximized");
    theParent.style.height = theHeight + "px";
  } else {
    theParent.classList.remove("window-maximized");
  }
}

// minimize window
var minBtn = document.getElementsByClassName("fa-window-minimize");

for (var k = 0; k < minBtn.length; k++) {
  minBtn[k].addEventListener("click", minWindow);
}

function minWindow() {
  var theParent = this.parentElement.parentElement;
  theParent.classList.add("minimized-window");
  theParent.classList.remove("active-window");
  taskbarProg[1].classList.remove('open-program');
}

// Function to get the next available data-window value
function getNextWindow(baseName) {
  // Find all elements with a data-window attribute starting with baseName
  var $existingElements = $('.open-window');
  
  // Initialize the highest number
  var maxNumber = 0;
  var num = [];

  // Iterate through the existing elements
  $existingElements.each(function() {
    var dataWindow = $(this).data('window');
    const match = dataWindow.match(/([a-zA-Z]+)(\d*)/); // Match letters and numbers
    
    if(match[1]==baseName){
      num[maxNumber] = match[2];
      maxNumber++;
    }
  });
  
  function findMissingNumber(arr, max) {
    if(arr.includes('')){
      for (let i = 0; i <= max; i++) {
        if (!arr.includes(`${i}`)) {
          return i; // Return the first number not found in the array
        }
      }
    }
    return ''; // Return null if all numbers are found
  }
  // console.log(num);
  index = findMissingNumber(num, num.length+1);

  // Return the next available data-window value
  return baseName + index;
}

let win_data = {
  "filemanager":{"name":"File Manager", "fa-icon":"fa-folder", "src":"./fm2/"},
  "recyclebin":{"name":"Recycle Bin", "fa-icon":"fa-trash", "src":""},
  "terminal":{"name":"Terminal", "fa-icon":"fa-terminal", "src":"./cli/"}
};
// open desktop icons
function openIcon(theItem) {
  var attr = theItem.getAttribute('data-window');
  // var baseName = 'filemanager';
  var nextWindow = getNextWindow(attr);
  
  var uname = "Sandeep";
  
  // create taskbar program div
  var theTaskbar = document.getElementById('taskbar');
  var taskbar = document.createElement('div');
  taskbar.setAttribute('class', 'taskbar-item taskbar-program open-program');
  
  taskbar.setAttribute('data-window', nextWindow);
  
  taskbar.addEventListener('click', openProgram, false);
  var theText = win_data[attr]['name'];
  var text = document.createTextNode(theText)
  var createI = document.createElement('i');
  
  createI.setAttribute('class', `fa ${win_data[attr]['fa-icon']} menu-item-icon`);
  taskbar.appendChild(createI);
  
  taskbar.appendChild(text);
  var before = document.getElementsByClassName('right-side')[0];
  theTaskbar.insertBefore(taskbar, before);
  
  // create the window
  var newWindow = document.createElement('div');
  newWindow.setAttribute('class', 'open-window');
  newWindow.addEventListener('click', activeWindow, false);
  
  newWindow.setAttribute('data-window', nextWindow);
    
  var getDesktop = document.getElementsByClassName('desktop')[0];
  getDesktop.appendChild(newWindow);
  $(newWindow).trigger("click");

  var createTitleBar = document.createElement('div');
  createTitleBar.setAttribute('class', 'titlebar');
  var createClose = document.createElement('i');
  createClose.setAttribute('class', 'fa fa-close titlebar-icons');
  createClose.addEventListener('click', closeWindow, false);
  var createMax = document.createElement('i');
  createMax.setAttribute('class', 'fa fa-window-maximize titlebar-icons');
  createMax.addEventListener('click', maxWindow, false);
  var createMin = document.createElement('i');
  createMin.setAttribute('class', 'fa fa-window-minimize titlebar-icons');
  createMin.addEventListener('click', minWindow, false);
  var createUp = document.createElement('i');
  createUp.setAttribute('class', 'fa fa-arrow-up titlebar-icons');
  var createTitle = document.createElement('span');
  createTitle.setAttribute('class', 'window-title');
  // var titleText = (attr == "filemanager") ? `${uname} - File Manager` : (attr == "terminal") ? `${uname} - Terminal` : `${uname} - Recycle Bin`;
  var titleText = `${uname} - ${win_data[attr]['name']}`;
  
  var addText = document.createTextNode(titleText);
  createTitle.appendChild(addText);
  var createIcon = document.createElement('span');
  
  createIcon.setAttribute('class', `fa ${win_data[attr]['fa-icon']} window-icon`);
  
  newWindow.appendChild(createTitleBar);
  createTitleBar.appendChild(createClose);
  createTitleBar.appendChild(createMax);
  createTitleBar.appendChild(createMin);
  createTitleBar.appendChild(createUp);
  createTitleBar.appendChild(createTitle);
  createTitleBar.appendChild(createIcon);
  
  if(win_data[attr]['src']){
    var $frame = $('<iframe>', {
      'src': `${win_data[attr]['src']}`,
      'style':" flex: 1; width: 100%; "
    });
    
    newWindow.appendChild($frame[0]);
  }

}

// moveable jQuery  
$(document).ready(function() {
  // resize
  var par = $(".titlebar").parent();
  
  $(par).resizable({
    minWidth: 300,
    minHeight: 200
  });
  
  $(par).draggable({ handle: ".titlebar" });
  
  /*$('body').on('DOMNodeInserted',function(e){
    $('.open-window').draggable();
    
    $('.open-window').resizable({
      minWidth: 300,
      minHeight: 200
    });
  });*/
  
  // Function to make elements draggable and resizable
  function makeElementsInteractive() {
      $('.open-window').draggable();
      
      $('.open-window').resizable({
          minWidth: 300,
          minHeight: 200
      });
  }
  
  // MutationObserver callback
  const observer = new MutationObserver(function(mutationsList) {
      for (let mutation of mutationsList) {
          if (mutation.type === 'childList') {
              makeElementsInteractive();
          }
      }
  });
  
  // Start observing the body for changes
  observer.observe(document.body, {
      childList: true, // observe direct children being added or removed
      subtree: true    // observe the entire subtree of the body
  });


  // desktop icon
  $(".desktop-icon").draggable();
});