<template>
    <div class="textBox">
        This is a text box.
    </div>
</template>

<script>

    export default {
        name: 'text-box',
        props: {
            text: {
                type: String,
                default: "[Default text!]"
            }
        },
        data: function() {
            return {
            }
        },
        computed: {
        },
        methods: {
        },
        created: function() {
        },
        beforeDestroy: function(){
        }
    }
</script>

<style scoped>
    .textBox {
        padding: 20px;
        border: 1px dotted red;
    }
</style>
