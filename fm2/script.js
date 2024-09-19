/*
Simple file manager front-end interface.

Realized features:
  Control panel
  Context menu
  Drag-n-Drop
  
*/

// 1 - File system model
var root = [
  {
    name: 'css',
    type: 'folder',
    contains: [
      {
        name: 'style.css',
        type: 'file'
      },
      {
        name: 'header.css',
        type: 'file'
      },
      {
        name: 'footer.css',
        type: 'file'
      }
    ]
  },
  {
    name: 'js',
    type: 'folder',
    contains: [
      {
        name: 'slick',
        type: 'folder',
        contains: [
          {
            name: 'slick.min.js',
            type: 'file'
          },
          {
            name: 'slick.js',
            type: 'file'
          },
          {
            name: 'slick.css',
            type: 'file'
          }
        ]
      },
      {
        name: 'jquery',
        type: 'folder',
        contains: [
          {
            name: 'jquery.js',
            type: 'file'
          },
          {
            name: 'jquery.min.js',
            type: 'file'
          }
        ]
      }
    ]
  }
];

// 2 - functions for simulating file system operation

let dir = root; // directory being viewed
let path = [root]; // reference path to directory
let pathString = ['..']; // string path to directory

let buffer = null, // clipboard
    cutPath = ''; // path to the file to be cut

// Displays the contents of a directory
function showDir() {
  let result = []
  dir.forEach((item)=>{
    result.push(item.name);
  });
  result.sort();
  return result.join(', ');
}

// Creates a directory
function makeDir(name) {

 if (!!dir.find((i)=>i.name === name)) return false; // we do nothing if such a folder already exists
  
  let folder = { // blank of new folder
    name: name,
    type: 'folder',
    contains: []
  };
  
  dir.push(folder); 
  return true;
}

// Creates a file
function makeFile(name) {
  if (!!dir.find((i)=>i.name === name)) return false;
  
  let file = {
    name: name,
    type: 'file'
  };
  
  dir.push(file);
  return true;
}

// Navigate through a directory (1 step)
function changeDir(name) {
  // 1 - move to root directory
  if (name === '..') {
    dir = root;
    path = [root];
    pathString = ['..'];
    return true;
  }
  
  // 2 - move to parent directory
  if (name === '.') {
    if (path.length == 1) {
      dir = root;
      path = [root];
      pathString = ['..'];
    } else {
      dir = path[path.length - 1];
      path.pop();
      pathString.pop();
    }
    return true;
  }
  
  // 3 - move to child directory
  let newDir = dir.find((i)=>i.name === name);
  if (!!newDir && newDir.type === 'folder') {
    path.push(dir);
    pathString.push(name);
    dir = newDir.contains;
    return true;
  } 
  return false;
}

// Navigating a path, stepping through the changeDir function
function movePath(path) {
  let arr = path.split('/');
  
  arr.forEach((name)=>{
    changeDir(name);
  });
  
  return getPath();
}

// Getting the current path string
function getPath() {
  return pathString.join('/');
}

// Rename file/folder
function rename(oldname, newname) {
  let item = dir.find((i)=>i.name === oldname);
  let isExist = dir.find((i)=>i.name === newname);
  if (!!item && !isExist) {
    item.name = newname;
    return true;
  } else return false;
}

//Deleting a file/folder
function del(name) {
  let file = dir.findIndex((i)=>i.name === name);
  if (file >= 0) dir.splice(file, 1);
}

// Copy file/folder to clipboard
function copy(name) {
  let selected = dir.find((i)=>i.name === name);
  
  let copied = JSON.parse(JSON.stringify(selected)); // the easiest way I have found to deep clone 8)
  buffer = copied;
}

// Pastes a file from the buffer
function paste() {
  if (!buffer) return false; // smoke bamboo if the buffer is empty
  
  let file = buffer,
      fileName = file.name;
  
  let hasFile = !!(dir.find((i)=>i.name === fileName)); 
  // check for a file with the same name.
  // If there is a file with that name in the directory, add "copy" to the end
  if (hasFile) {
    if (file.type == 'folder') {
      file.name = file.name + ' copy';
    } else {
      let splitted = file.name.split('.');
      if (splitted.length > 1) {
        file.name = splitted.slice(0, -1).join('.') + ' copy' + '.' + splitted[splitted.length - 1];
      } else {
        file.name = file.name + ' copy';
      }
    }
  }
  
  if (!!cutPath) { // delete the old copy if the file is cut
    let currentPath = getPath();
    
    let pathToCut = cutPath.split('/').slice(0,-1).join('/'),
        fileName = cutPath.split('/')[cutPath.split('/').length - 1];
    
    movePath(pathToCut);
    del(fileName);
    movePath(currentPath);
  }
  
  dir.push(file);
  buffer = null;
  return true;
}

// Cuts a file to the buffer
function cut(name) {
  let file = dir.find((i)=>i.name === name);
  if (!!file) {
    copy(name);
    cutPath = getPath() + '/' + name;
  }
}

// Moving a file
function move(file, to) {
  let currentDir = getPath();
  cut(file);
  movePath(to);
  paste();
  movePath(currentDir);
}

// 2 - Visualization using jQuery

function render() {
  $('#path-input').val(getPath());
  let explorer = $('.explorer');
  explorer.html(' ');
  
  let folders = dir.filter((i)=>i.type == 'folder').sort();
  let files = dir.filter((i)=>i.type == 'file').sort();
  
  folders.concat(files).forEach((item)=>{
    let type = item.type == "file" ? "file" : "dir",
        name = item.name,
        sized = item.type == "file" ? `Size: ${mb_size(item.size)}\n` : "";
        icon = name.split('.').pop();
    let block = // icon template
        $(`<div class="file" title="${name}\n${sized}Date Modified: ${item.modified}"><div class="ico ico-${type} file-${icon}"> <i class="-${type}-icon -file-${icon}"></i> </div><div class="name">${name}</name></div>`);
    
    block.name = name;
    // we add event handlers right here
    block.click(function(){
      select( $(this) );
  });
    block.dblclick(function(){
      unselect();
      let name = $(this).find('.name').html();
      movePath(name);
      render();
  });
    
    explorer.append(block);
  });
  
  // add drag-n-drop
  
  $('.file').draggable({
    stop: function(){
      render();
      unselect();
    },
    start: function() {
    $(this).addClass('draggable');
      select($(this));
    }
  }).droppable({
    drop: function() {
      if ($(this).find('.ico-file')[0]) return;
      let dirname = $(this).find('.name').html();
      move(selected, dirname);
    }
  });
}

// render();

const json_mod = (data) => {
  return data.map(item => {
    if (item.isDirectory) {
      return {
        name: item.name,
        type: "folder",
        modified: item.modified,
        contains: json_mod(item.items)
      };
    } else {
      return {
        name: item.name,
        type: "file",
        modified: item.modified,
        size: item.size
      };
    }
  });
};

set_json = (data)=>{
  root = json_mod(data);
  
  dir = root; // directory being viewed
  path = [root]; // reference path to directory
  
  render();
  movePath(findPaths(root[0])[0]);
  render();
};
$.getJSON("../dir.php", set_json);


$.ajax({
  url: '../dir.php'
})
.done(function(data) {
  console.log("Done");
  
})
.always(function(data) {
  console.log("Always");
  
});


// Selecting files
let selected = null;

function select(elem) {
  $('.selected').removeClass('selected');
  elem.addClass('selected');
  
  let name = elem.find('.name').html();
  selected = name;
  $('#btn-del, #btn-rename, #btn-copy, #btn-cut').prop('disabled', false);
}

function unselect() {
  selected = null;
  $('.selected').removeClass('selected');
  $('#btn-del, #btn-rename, #btn-copy, #btn-cut').prop('disabled', true);
  hideContext();
}

// Control panel and context menu buttons
$('#path-btn').click(()=>{ // move button in address bar
  let path = $('#path-input').val();
  movePath(path);
  render();
});

$('#btn-home').click(()=>{ // return to root directory
  movePath('..');
  render();
});

$('#btn-up').click(()=>{ // return to parent directory
  movePath('.');
  render();
});

$('#btn-newdir, #btn-modal-mkdir').click(()=>{ // New folder
  let dirname = prompt('Directory name:', 'New Folder');
  if (dirname) {
    makeDir(dirname);
    render();
  }
});

$('#btn-newfile, #btn-modal-mkfile').click(()=>{ // New file
  let filename = prompt('File name:', 'New File.txt');
  if (filename) {
    makeFile(filename);
    render();
  }
});

$('#btn-del, #btn-modal-del').click(()=>{ // Removal
  del(selected);
  render();
  unselect();
});

$('#btn-copy, #btn-modal-copy').click(()=>{ // Copy
  copy(selected);
  $('#btn-paste, #btn-modal-paste').prop('disabled', false);
});

$('#btn-cut, #btn-modal-cut').click(()=>{ // cut out
  cut(selected);
  $('#btn-paste, #btn-modal-paste').prop('disabled', false);
});

$('#btn-paste, #btn-modal-paste').click(()=>{ // insert
  paste();
  render();
  unselect();
  $('#btn-paste, #btn-modal-paste').prop('disabled', true);
});

$('#btn-rename, #btn-modal-rename').click(()=>{ // rename
  let newName = prompt('New name:', selected);
  if (newName) {
    rename(selected, newName);
    unselect();
    render();
  }
});

$('.explorer').click((e)=>{ // Deselect by clicking on the background
   if (!e.target.closest('.file')) {
     unselect();
   }
});

// Context menu
let contextOpened = 0;

$('.explorer').contextmenu(function(e){
  e.preventDefault();
  unselect();
  let menu;
  
  if (!e.target.closest('.file')) {
    menu = $('.contextmenu-dir');
  } else {
    menu = $('.contextmenu-files');
    e.target.click();
  }
  
  let x = e.pageX;
  let y = e.pageY;
  
  showContext(menu, x, y);
  
});

function showContext(elem, x, y) {
  if (contextOpened) {
    hideContext(show);
  } else {
    show();
  }
  
  function show() {
    elem.css({
        'top': y,
        'left': x
      }).slideDown("fast");
    contextOpened = 1;
  }
}

function hideContext(cb) {
  if (!cb) cb = function(){};
  
  $('.contextmenu').each(function(){
    $(this).slideUp("fast", cb);
  });
  contextOpened = 0;
}

$('.contextmenu').click(()=>{
  hideContext();
})

function mb_size(bytes) {
  if (bytes === 0) return '0 Bytes';

  // Define size units in order
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  // Calculate the index for the size unit
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  // Format the size
  const size = parseFloat((bytes / Math.pow(1024, i)).toFixed(2));

  return `${size} ${sizes[i]}`;
}

function findPaths(node, currentPath = '') {
    // Create the full path for the current node
    const newPath = currentPath ? `${currentPath}/${node.name}` : node.name;
    
    // If the node has more than one item in 'contains', add the path to the results
    let paths = [];
    if (node.contains && node.contains.length > 1) {
        paths.push(newPath);
    }
    
    // Recursively check each item in 'contains'
    if (node.contains) {
        for (const child of node.contains) {
            paths = paths.concat(findPaths(child, newPath));
        }
    }
    
    return paths;
}