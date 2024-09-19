
        $(document).ready(function() {
          usr = 'sandeep';
          cwd = '';
          cmd_j = ['hello', 'cd', 'ls', 'dir', 'date', 'help'];
          dir_list = [];
          dir_filt = [];
          dir_set = (extra) => {
            dir_list = extra.output2;
            dir_filt = extra.filt2;
          };
          // php_exec(str, (output)=>{ dir_list=output; });
          
          prom1 = () => {return `${usr}@XFCE:~${cwd}$ `};
          
          php_exec = (command, fun, cmd='cmd') => {
            // event.preventDefault(); // Prevent the form from submitting the traditional way
            // console.log("Command Executed");
            $.ajax({
              type: 'POST',
              url: 'cmd.php',
              data: { condition: cmd, command: command },
              dataType: 'json',
              success: function(response) {
                if (response.error) {
                  fun('Error: ' + response.error, response);
                } else {
                  fun(response.output, response);
                }
              },
              error: function(xhr, status, error) {
                fun('AJAX error: ' + error, xhr);
              }
            }).always(function(data) {
              // console.log("Always", data);
            });
          };
          
          php_exec('dir .', (output, extra)=>{dir_set(extra);},'ls');
          go_home = () => {
            php_exec('.', (output, extra)=>{ 
              cwd=output.replace(/[/\\]+/g, '/')+'/';
              $.terminal.active().set_prompt(prom1());
              return cwd;
            },'cwd');
          };
          
          
          comp = (line) => { 
            console.log(line);
            return [ ...cmd_j, ...dir_list]; 
          };
          cd2= (currentPath, command) => {
            // Handle the '..' command to move up one directory
            if (command === '..') {
              currentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
             /* if(currentPath.includes('/')){
              currentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
              }else{
              currentPath = currentPath.substring(0, currentPath.lastIndexOf('\\'));
              }*/
            } else if(command == '.'){
              
            } else {
              // Handle directory or file navigation
              // Ensure only a single directory separator
                currentPath = currentPath + (currentPath.endsWith('/') ? '' : '/') + command;
              /*if (command.includes('/') || command.includes('\\')) {
                currentPath = currentPath + (currentPath.endsWith('/') || currentPath.endsWith('\\') ? '' : '/') + command;
              } else {
                currentPath = currentPath + (currentPath.endsWith('/') || currentPath.endsWith('\\') ? '' : '/') + command;
              }*/
            }
            return currentPath;
          };
          cd = (currentPath, command) => {
            // Normalize the path (remove trailing slashes)
            currentPath = currentPath.trim().replace(/[/\\]+$/, '');
            currentPath = currentPath.replace(/[/\\]+/g, '/');
            if(command.toUpperCase().startsWith('C:')){
              console.log('C:');
              
            }else if(command.startsWith('..') && command.includes('/')){
              cmdarr = command.split("/");
              console.log(cmdarr);
              cmdarr.forEach((item, index)=>{
                currentPath = cd2(currentPath, item);
              });
            }else if(command.startsWith('..')){
              console.log('..');
              currentPath = cd2(currentPath, command);
              
            }else if(command.startsWith('.')){
              console.log('.');
              if(command.startsWith('./')){
                command = command.replace(/^\.\/+/, '');
                currentPath = cd2(currentPath, command);
              }else{
                currentPath = cd2(currentPath, command);
              }
              
            }else if(command.startsWith('~')){
              console.log('~');
              go_home();
            }else if(command.startsWith('/')){
              console.log('/');
              
            }else if(command.includes('/2')){
              console.log('/2');
              
            }else{
              console.log('else');
              currentPath = cd2(currentPath, command);
            }
            // Normalize the path (replace all separators with '/')
            // currentPath = currentPath.replace(/[/\\]+/g, '/');
            currentPath = currentPath.replace(/[/\\]+$/, '');
            return currentPath+'/';
          };
            
          
            // Initialize jQuery Terminal
            $('#terminal').terminal(function(str, term) {
              if (str === '') {
                  return;
              }
              
              command = ( str.indexOf(' ')==-1? str.substring(str.indexOf(' ') + 1):str.substring(0, str.indexOf(' ')) ).trim();
              str2 = ( str.indexOf(' ')==-1? str.substring(0, str.indexOf(' ')):str.substring(str.indexOf(' ') + 1) ).trim();
              
              switch (command) {
                case 'hello':
                  term.echo('Hello, World!');
                  break;
                case 'cwd':
                  php_exec('cwd', (output, extra)=>{
                    // dir_set(extra);
                    term.echo(output.replace(/[/\\]+/g, '/'));
                  },'cwd');
                  break;
                  
                case 'cd':
                  // cwd = cd(cwd, str2);
                  cdval = cd(cwd, str2);
                  php_exec('cd '+cdval, (output, extra)=>{
                    
                    if(!extra.error2){
                      cwd=cdval;
                      term.set_prompt(prom1());
                      php_exec('dir '+cwd, (output, extra)=>{
                        dir_set(extra);
                      },'ls');
                    }else{
                      term.echo(extra.error2);
                    }
                    
                  });
                  break;
                  
                case 'dir':
                case 'ls':
                  cmd1 = str;
                  if(!str2.trim()){
                    cmd1 = `${command} ${cwd}`;
                  }else if(str2.startsWith('..') && str2.includes('>>')){
                    const match = str2.match(/^(.*?)(>>.*)$/);
                    
                    if (match) {
                      const pathPart = match[1].trim(); // '../abc/files'
                      const redirectPart = match[2].trim(); // '>>a.txt'
                      
                      let cdval = cd(cwd, pathPart);
                      cmd1 = `${command} "${cdval}" ${redirectPart}`;
                    }
                  }else if(str2.startsWith('..') && str2.includes(' ')){
                    // Split the string into two parts: path and other part
                    const parts = str2.split(' '); // Split by space
                    const path1 = parts[0]; // First part is the path
                    const otherPart = parts.slice(1).join(' '); // Join the rest back into a string
                    let cdval = cd(cwd, path1);
                    cmd1 = `${command} "${cdval}" ${otherPart}`;
                  }else{
                    let cdval = cd(cwd, str2);
                    cmd1 = `${command} ${cdval}`;
                  }
                  // console.log(!str2.trim(), cmd1);
                  php_exec(cmd1, (output, extra)=>{
                    // console.log(extra);
                    if(!('error2' in extra)){
                      if(extra.output !== 0 && extra.output.length !== 0 ){
                        term.echo(extra.output2);
                        // console.log(`${output} && ${output.length}`, output !== 0 && output.length !== 0 );
                        // console.log(extra.filt2);
                      }else if(extra.result==0){
                        term.echo(extra.output);
                      }else{term.echo('Command not found: ' + cmd1);}
                    }else{term.echo(extra.error2);}
                  },'ls');
                  break;
                  
                case 'date':
                  term.echo(new Date().toString());
                  break;
                case 'help':
                  term.echo('Available commands: hello, date, help');
                  break;
                default:
                  php_exec(str, (output, extra)=>{
                    // console.log(output, output.length);
                    if(!('error2' in extra)){
                    if(extra.output && extra.output.length){term.echo(output);}
                    else{
                      term.echo('Command not found: ' + str);
                      // term.echo(extra.error2);
                    }}else{term.echo(extra.error2);}
                  });
              }
            }, {
                greetings: 'Welcome to jQuery Terminal',
                name: 'js_demo',
                prompt: prom1,
                tabcompletion: true,
                history: { maxLength: 50 },
                onBlur: function() { console.log('Terminal lost focus'); },
                onFocus: function() { console.log('Terminal gained focus'); },
                completion: comp
            });
            go_home();
            
        });