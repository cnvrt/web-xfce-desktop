<?php
header('Content-Type: application/json');

// Get the directory path from query parameter or set to current working directory
$dir = getcwd();
if (isset($_GET['p'])) {
  if (strpos(strtoupper($_GET['p']), 'C:') === false) {
    $dir = getpath($_GET['p']);
  } else {
    $dir = $_GET['p'];
  }
}

// Function to get the absolute path
function getpath($relativePath) {
    $currentDir = getcwd();
    $absolutePath = realpath($currentDir . DIRECTORY_SEPARATOR . $relativePath);
    return $absolutePath;
}

// Function to split path by Unix-style separator '/'
function splitPath($path) {
    $path = trim($path, '/');
    return explode('/', $path);
}

// Function to split path by Windows-style separator '\'
function splitWindowsPath($path) {
    $path = trim($path, '\\');
    return explode('\\', $path);
}

// Function to split path by the appropriate separator
function splitPathBySeparator($path) {
    if (strpos($path, '/') !== false) {
        return splitPath($path);
    } elseif (strpos($path, '\\') !== false) {
        return splitWindowsPath($path);
    }
    return [$path];
}

// Function to convert path array to JSON structure
function arrayToJson($path, $jdata) {
    $components = splitPathBySeparator($path);
    $filePath = "";

    $buildTree = function($components) use (&$buildTree, $jdata, &$filePath) {
        if (empty($components)) {
          return $jdata;
        }
        
        $name = array_shift($components);
        $filePath = $filePath.$name."\\";
        
        // Ensure path is correctly formatted
        $filePath = realpath($filePath);
        
        $node = [
            "name" => $name,
            "isDirectory" => true,
            'modified' => date("d/F/Y h:i:s A", filemtime($filePath)),
            "items" => $buildTree($components)
        ];
        
        return [$node];
    };
    
    $tree = $buildTree($components);
    return $tree;
}

// Function to scan the directory and return details
function scan_path($path, $folder = false) {
    $result = [];

    if (file_exists($path) && is_dir($path)) {
        $dh = @opendir($path);
        if ($dh) {
            while (($file = readdir($dh)) !== false) {
                if ($file !== '.' && $file !== '..') {
                    $filePath = $path . DIRECTORY_SEPARATOR . $file;

                    $details = [
                      'name' => $file,
                      'isDirectory' => is_dir($filePath),
                      'modified' => file_exists($filePath) ? date("d/F/Y h:i:s A", filemtime($filePath)) : "N/A"
                    ];
                    
                    if (is_dir($filePath)) {
                      // $details['items'] = getDirectoryDetails($filePath); // Scan Again if it's a Folder 
                      $details['items'] = []; // Initialize as empty for directories
                    } else {
                      $details['size'] = is_file($filePath) ? filesize($filePath) : 0;
                    }
                    
                    if ($folder && is_dir($filePath)) {
                      $result[] = $details;
                    }
                    if (!$folder && !is_dir($filePath)) {
                      $result[] = $details;
                    }
                }
            }
            closedir($dh);
        } else {
            $result[] = ["error" => "Unable to open directory: $path"];
        }
    } else {
        $result[] = ["error" => "Directory does not exist: $path"];
    }

    return $result;
}

// Function to get directory details and build JSON
function getDirectoryDetails($path) {
  $result = array_merge(scan_path($path, true), scan_path($path, false));
  $result2 = arrayToJson($path, $result);
  return $result2;
}

// Get the details of the folder and encode it into JSON format
$directoryDetails = getDirectoryDetails($dir);

echo json_encode($directoryDetails, JSON_PRETTY_PRINT);
?>
