$(function () {
  function fmpath(fileSystem){
    $("#file-manager").dxFileManager({
        currentPath: "C:/xampp2/htdocs/file/xfce",
        root: "C:/xampp2/htdocs/file/xfce",
        name: "fileManager",
        fileProvider: fileSystem,
        itemView: {
            mode: "thumbnails",
        showParentFolder: true
        }, 
        height: "100%",
        permissions: {
            create: true,
            copy: true,
            move: true,
            remove: true,
            rename: true,
            upload: true,
            download: true,
        },
        customizeThumbnail: function (fileManagerItem) {
            if (fileManagerItem.isDirectory)
                // return "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/thumbnails/folder.svg";
                return "folder.svg";
            var fileExtension = fileManagerItem.getExtension();
            switch (fileExtension) {
                case ".txt":
                    return "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/thumbnails/doc-txt.svg";
                    break;
                case ".rtf":
                    return "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/thumbnails/doc-rtf.svg";
                    break;
                case ".xml":
                    return "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/thumbnails/doc-xml.svg";
                    break;
            }
        },
    contextMenu: {
        enabled: true
    },
    toolbar: {
        items: [
            {
                widget: "dxButton",
                options: {
                    text: "upload",
                    onClick: function() {
                        // Handle upload
                        console.log("Upload OK");
                    }
                }
            }
        ]
    },
    onItemClick: function(e) {
        if (e.itemData.isDirectory) {
            // Logic for directory click (e.g., navigate to the directory)
            console.log("Upload OK");
        }
    }
    });
  }
  $.getJSON("../dir.php", (data)=>{fmpath(data);});
});

/*var fileSystem = [
    {
        name: "Documents",
        isDirectory: true,
        items: [
            {
                name: "Projects",
                isDirectory: true,
                items: [
                    {
                        name: "About.rtf",
                        isDirectory: false,
                        size: 1024
                    },
                    {
                        name: "Passwords.rtf",
                        isDirectory: false,
                        size: 2048
                    }
                ]
            },
            {
                name: "About.xml",
                isDirectory: false,
                size: 1024
            },
            {
                name: "Managers.rtf",
                isDirectory: false,
                size: 2048
            },
            {
                name: "ToDo.txt",
                isDirectory: false,
                size: 3072
            }
        ],
    },
    {
        name: "Images",
        isDirectory: true,
        items: [
            {
                name: "logo.png",
                isDirectory: false,
                size: 20480
            },
            {
                name: "banner.gif",
                isDirectory: false,
                size: 10240
            }
        ]
    },
    {
        name: "System",
        isDirectory: true,
        items: [
            {
                name: "Employees.txt",
                isDirectory: false,
                size: 3072
            },
            {
                name: "PasswordList.txt",
                isDirectory: false,
                size: 5120
            }
        ]
    },
    {
        name: "Description.rtf",
        isDirectory: false,
        size: 1024
    },
    {
        name: "Description.txt",
        isDirectory: false,
        size: 2048
    }
];*/