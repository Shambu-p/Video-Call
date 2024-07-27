class ZewdSocket {

    socket;
    user;
    handlers = new Map();

    setHandler(handler_name, handler_function) {
        this.handlers.set(handler_name, handler_function);
    }

    callHandler(handler_name, data, user) {

        if(handler_name == "get_auth") {
            // console.log("get_auth received ", this);
            this.user = data;
            return;
        }
        let found_handler = this.handlers.get(handler_name);
        if(!found_handler){
            console.log("handler not found #"+handler_name);
            return;
        }

        found_handler(data);

    }

    emit(handler_name, data) {
        console.log(handler_name, " emitted");
        this.socket.send(JSON.stringify({
            token: this.user.sys_id,
            handler_name,
            data
        }));
    }

    getUser() {
        this.socket.send(JSON.stringify({
            handler_name: "get_auth",
            data: {
                name: "ab",
            }
        }));
    }

    connect(address) {
        // socket = new WebSocket('ws://localhost:7000');
        let temp_socket = new WebSocket(address);

        // Connection opened
        temp_socket.addEventListener('open', function (event) {
            console.log('Connected to WebSocket server');
            temp_socket.send(JSON.stringify({
                handler_name: "get_auth",
                data: {
                    name: "ab",
                }
            }));
        });

        let temp_zewd_socket = this;
        
        // Listen for messages
        temp_socket.addEventListener('message', function (event) {
            // console.log('Message from server ', event.data);
            let req = JSON.parse(event.data);
            temp_zewd_socket.callHandler(req.handler_name, req.data, temp_zewd_socket.user);
        });

        // Handle connection errors
        temp_socket.addEventListener('error', function (event) {
            console.error('WebSocket error observed:', event);
        });

        // Connection closed
        temp_socket.addEventListener('close', function (event) {
            console.log('WebSocket connection closed:', event);
        });

        this.socket = temp_socket;

    }
}

