<style scoped>
/* HIDE RADIO */
[type=radio] { 
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

/* IMAGE STYLES */
[type=radio] + img {
    cursor: pointer;
    width: 6em;
    height: 5em;
}

/* CHECKED STYLES */
[type=radio]:checked + img {
    outline: 3px solid #0057ff;
}
</style>
<template>
    <div>
        <b-row>
            <b-col class="text-center">{{my.name}} <b>VS</b> {{opponent.name}}</b-col>
        </b-row>
        
        <br>

        <b-row>
            <b-col>
                <b-alert 
                    :show="time.dismissCountDown"
                    variant="warning"
                    @dismissed="time.dismissCountDown=0"
                    @dismiss-count-down="countDownChanged">
                    <p>Choose a game option in {{time.dismissCountDown}} seconds!</p>
                    <b-progress variant="warning"
                                :max="time.dismissSecs"
                                :value="time.dismissCountDown"
                                height="4px">
                    </b-progress>
                </b-alert>
                <b-alert :show="time.dismissCountDown == 0 && time.showDismissibleAlert == true">
                    <p>Waiting for the result.</p>
                </b-alert>

                <b-alert variant="success" :show="showVictory" class="text-center">
                    Victory!
                </b-alert>
                <b-alert variant="danger" :show="showDefeat" class="text-center">
                    Defeat!
                </b-alert>
            </b-col>
        </b-row>

        <br>

        <b-row v-if="time.showDismissibleAlert == true">
            <b-col class="text-center">
                <label>
                    <input type="radio" name="test" value="1" v-model="option">
                    <img src="img/stone.jpg">
                </label>

                <label>
                    <input type="radio" name="test" value="2" v-model="option">
                    <img src="img/paper.jpg">
                </label>

                <label>
                    <input type="radio" name="test" value="3" v-model="option">
                    <img src="img/scissors.jpg">
                </label>
            </b-col>
        </b-row>

        <b-row v-if="showVictory == true || showDefeat == true">
            <b-col class="text-center">
                <b-button href="/home">Play Again</b-button>
            </b-col>
        </b-row>

    </div>
</template>
<script>
export default {
    data() {
        return {
            my: {},
            opponent: {},
            dataDuel: {},
            results: {},
            time: {
                dismissSecs: 10,
                dismissCountDown: 0,
                showDismissibleAlert: true 
            },
            option: 1,
            showVictory: false,
            showDefeat: false,
        }
    },
    beforeCreate() {
        this.$socket.emit('getStartDuel', this.$route.params.play)
    },
    beforeMount() {
        this.time.dismissCountDown = this.time.dismissSecs
    },
    sockets: {
        retStartDuel: function (data) {
            this.dataDuel = data
            this.my = data.data
            this.opponent = data.opponent
        },
        resultOptionDuel: function (data) {
            this.time.dismissCountDown = this.time.dismissSecs
        },
        victoryOptionDuel: function (data) {
            this.results = data
            this.time.dismissCountDown = 0
            this.time.showDismissibleAlert = false

            if (data) {
                this.showVictory = true
            } else {
                this.showDefeat = true                
            }
        },
    },
    methods: {
        countDownChanged (dismissCountDown) {
            this.time.dismissCountDown = dismissCountDown
            if (dismissCountDown == 0 && this.time.showDismissibleAlert == true) {
                this.$socket.emit('setOptionDuel', {
                    id_duel: this.dataDuel.id,
                    option: this.option
                })
            }
        }
    }
}
</script>