const server = require('http').createServer()
const io = require('socket.io')(server)

let clients = []
let duels = []
const buelsResult = {
    1 : [2],
    2 : [3],
    3 : [1],
}

io.on('connection', client => {
    clients.push({
        secret: client.id,
        online: false,
        json: {}
    })

    client.on('start', data => {
        clients.map(obj => {
            if (obj.secret == client.id) {
                obj.json = data
                if (data.on != null) {
                    obj.online = true
                }
            }
        })

        client.emit('listClients', clients)
        client.broadcast.emit('listClients', clients)
    })

    client.on('to_duel', data => {
        clients.map(obj => {
            if (obj.secret == client.id || obj.secret == data.secret) {
                obj.json.duel = true
            }
        })

        client.emit('listClients', clients)
        client.broadcast.emit('listClients', clients)
        client.broadcast.to(data.secret).emit('orderOpponent', {
            opponent: data.opponent,
            secret: client.id
        })
    })

    client.on('orderOpponentCancel', data => {
        clients.map(obj => {
            if (obj.secret == client.id || obj.secret == data) {
                obj.json.duel = false
            }
        })

        client.emit('listClients', clients)
        client.broadcast.emit('listClients', clients)
        client.broadcast.to(data).emit('orderOpponentCancel', true)
    })

    client.on('opponentExpectingAccept', data => {       
        let id_duel = data.opponentSecret+'&&'+client.id

        let principal = {
            id : id_duel,
            mySecret : data.opponentSecret,
            opponentSecret : client.id,
            opponent: data.my,
            data: data.opponent
        }
        
        let opponent = {
            id : id_duel,
            mySecret : client.id,
            opponentSecret : data.opponentSecret,
            opponent: data.opponent,
            data: data.my
        }
        
        duels.push({
            id : id_duel,
            play_1: principal,
            play_2: opponent,
            results: [],
            upshot: 0
        })

        client.emit('expectingAccept', opponent)
        client.broadcast.to(data.opponentSecret).emit('expectingAccept', principal)
    })

    client.on('opponentExpectingCancel', data => {
        clients.map(obj => {
            if (obj.secret == client.id || obj.secret == data.secret) {
                obj.json.duel = false
            }
        })
        
        client.emit('listClients', clients)
        client.broadcast.emit('listClients', clients)
        client.broadcast.to(data.secret).emit('expectingCancel', data.opponent)
    })


    /**
     * Duel
     */
    client.on('getStartDuel', data => {
        duels.map(obj => {
            if (obj.id == data) {
                if (obj.play_1.mySecret == client.id) {
                    client.emit('retStartDuel', obj.play_1)
                } else {
                    client.emit('retStartDuel', obj.play_2)
                }
            }
        })
    })

    client.on('setOptionDuel', data => {
        duels.forEach((obj, i) => {
            if (obj.id == data.id_duel) {

                //Add
                if (obj.results.length == 0) {
                    duels[i].results.push({
                        1: {id: client.id, option: data.option},
                        2: {},
                        result: null
                    })
                } else if (obj.results[obj.results.length-1].result != null) {
                    duels[i].results.push({
                        1: {id: client.id, option: data.option},
                        2: {},
                        result: null
                    })
                } else {
                    obj.results[obj.results.length-1]['2'] = {id: client.id, option: data.option}
                }

                
                option1 = obj.results[obj.results.length-1]['1'].option
                option2 = obj.results[obj.results.length-1]['2'].option
                
                //Rules
                if (typeof option1 != 'undefined' && typeof option2 != 'undefined') {
                    if (option1 != option2) {
                        let victory = 1
                        buelsResult[option1.toString()].map(result => {
                            if (result == option2) {
                                victory = 2
                            }
                        })
                        obj.results[obj.results.length-1].result = victory
                    } else {
                        obj.results[obj.results.length-1].result = 0
                    }
                }
            }
        })


        //emit
        duels.map(obj => {
            if (obj.id == data.id_duel && obj.results[obj.results.length-1].result != null) {

                if (client.id == obj.results[obj.results.length-1]['1'].id) {
                    client.emit('resultOptionDuel', obj)
                    client.broadcast.to(obj.results[obj.results.length-1]['2'].id).emit('resultOptionDuel', obj)
                } else {
                    client.emit('resultOptionDuel', obj)
                    client.broadcast.to(obj.results[obj.results.length-1]['1'].id).emit('resultOptionDuel', obj)
                }


                play_1 = 0;
                play_2 = 0;
                obj.results.forEach( res => {
                    if (res.result == 1) {
                        play_1++
                    }
                    if (res.result == 2) {
                        play_2++
                    }
                })
                if (play_1 == 3) {
                    if (client.id == obj.play_1.mySecret) {
                        client.emit('victoryOptionDuel', true)
                        client.broadcast.to(obj.play_2.mySecret).emit('victoryOptionDuel', false)
                    } else {
                        client.emit('victoryOptionDuel', false)
                        client.broadcast.to(obj.play_1.mySecret).emit('victoryOptionDuel', true)
                    }
                }
                if (play_2 == 3) {
                    if (client.id == obj.play_2.mySecret) {
                        client.emit('victoryOptionDuel', true)
                        client.broadcast.to(obj.play_1.mySecret).emit('victoryOptionDuel', false)
                    } else {
                        client.emit('victoryOptionDuel', false)
                        client.broadcast.to(obj.play_2.mySecret).emit('victoryOptionDuel', true)
                    }
                }
            }
        })
    })

    
    client.on('disconnect', () => {
        clients.map(obj => {
            if (obj.secret == client.id) {
                clients.splice(clients.indexOf(obj), 1)
            }
        })

        client.emit('listClients', clients)
        client.broadcast.emit('listClients', clients)
    })
})

server.listen(3000)