<template>
    <div>
        <b-list-group v-for="(item, $index) in list" :key="$index">
            <b-list-group-item>

                <b-row class="justify-content-md-center">
                    <b-col cols="8">
                        {{item.json.name}}
                    </b-col>
                    <b-col cols="4" v-if="item.json.duel == false" style="text-align: end;">
                        <b-btn class="mt-2" @click="toDuel(item)">To Duel</b-btn>
                    </b-col>
                    <b-col cols="4" v-if="item.json.duel == true" style="text-align: end;">
                        <b-btn class="mt-1" disabled>Dueling</b-btn>
                    </b-col>
                </b-row>

            </b-list-group-item>
        </b-list-group>


        <b-modal ref="expectingOpponent" hide-header hide-footer no-close-on-backdrop no-close-on-esc>
            <div class="d-block text-center">
                <h3>Expecting Opponent</h3>
                <b-img src="img/load.gif" style="width: 3em;"/>
            </div>
            <b-btn class="mt-3" variant="outline-danger" block @click="expectingOpponentHide">Cancel Duel</b-btn>
        </b-modal>

        <b-modal ref="orderOpponent" hide-header hide-footer no-close-on-backdrop no-close-on-esc>
            <div class="d-block text-center">
                <h3>{{opponent.name}} is challenging you to a duel!</h3>
            </div>
            <b-btn class="mt-3" variant="outline-success" block @click="expectingOpponentAccept()">Accept Duel</b-btn>
            <b-btn class="mt-3" variant="outline-danger" block @click="expectingOpponentCancel()">Cancel Duel</b-btn>
        </b-modal>

        <b-modal ref="orderOpponentQuit" hide-header hide-footer no-close-on-backdrop no-close-on-esc>
            <div class="d-block text-center">
                <h3>{{opponent.name}} gave up the duel!</h3>
            </div>
            <b-btn class="mt-3" variant="outline-success" block @click="orderOpponentQuitHide()">OK</b-btn>
        </b-modal>

        <b-modal ref="expectingOpponentQuit" hide-header hide-footer no-close-on-backdrop no-close-on-esc>
            <div class="d-block text-center">
                <h3>{{opponent.name}} gave up the duel!</h3>
            </div>
            <b-btn class="mt-3" variant="outline-success" block @click="expectingOpponentQuitHide()">OK</b-btn>
        </b-modal>

    </div>
</template>
<script>
export default {
    data() {
        return {
            list: [],
            my: {},
            opponent: {},
            opponentSecret: 0
        }
    },
    beforeCreate() {
        axios.get('/my')
            .then((response) => {
                this.$socket.emit('start', {
                    on:     true,
                    duel:   false,
                    name:   response.data.name,
                    email:  response.data.email
                })
                this.my = response.data
            })
            .catch((error) => {
                console.log(error)
            })
    },
    sockets: {
        listClients: function (data) { //Online User Listing.
            this.list = []
            data.forEach(element => {
                if (
                    element.online == true &&
                    element.json.email != this.my.email
                ) {
                    this.list.push(element)
                }
            })
        },
        orderOpponent: function (data) { //Open modal when challenged
            this.opponent = data.opponent
            this.opponentSecret = data.secret

            this.$refs.orderOpponent.show()
        },
        orderOpponentCancel: function (data) { //Modal close when my opponent does.
            this.$refs.orderOpponent.hide()
            this.$refs.orderOpponentQuit.show()
        },
        expectingAccept: function (data) { //Modal close when my opponent does.
            this.$refs.expectingOpponent.hide()

            this.$router.push({ name: 'duel', params: { play: data.id }})
        },
        expectingCancel: function (data) { //Modal close when my opponent does.
            this.opponent = data

            this.$refs.expectingOpponent.hide()
            this.$refs.expectingOpponentQuit.show()
        },
    },
    methods: {
        toDuel($opponent) { //Challenge someone
            this.$refs.expectingOpponent.show()
            this.opponentSecret = $opponent.secret
            this.$socket.emit('to_duel', {
                secret:     $opponent.secret,
                opponent:   this.my
            })
        },
        expectingOpponentHide() { //I give up the challenge
            this.$refs.expectingOpponent.hide()
            this.$socket.emit('orderOpponentCancel', this.opponentSecret)
        },
        expectingOpponentAccept() { //I accept the challenge
            this.$refs.orderOpponent.hide()
            this.$socket.emit('opponentExpectingAccept', { 
                opponentSecret: this.opponentSecret,
                opponent: this.opponent,
                my: this.my
            })
        },
        expectingOpponentCancel() { //I do not accept the challenge
            this.$refs.orderOpponent.hide()
            this.$socket.emit('opponentExpectingCancel', {
                secret: this.opponentSecret,
                opponent:   this.my
            })
        },
        orderOpponentQuitHide() {
            this.$refs.orderOpponentQuit.hide()
        },
        expectingOpponentQuitHide() {
            this.$refs.expectingOpponentQuit.hide()
        }

    }
}
</script>