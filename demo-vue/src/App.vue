<script setup>
import { ref } from 'vue'
import axios from 'axios'
import getCaptcha from 'nia-captcha'

const captchareData = ref({
    ticket: '',
    randstr: ''
})

const res = ref('')

const click = async () => {
    const captchare = await getCaptcha('2046626881')
    console.log(captchare)
    captchareData.value = captchare
    const { data } = await axios.post('http://localhost:3000/', {
        ticket: captchare.ticket,
        randstr: captchare.randstr
    })
    res.value = data
}
</script>

<template>
    <button @click="click()">Click Me</button>
    <p>ticket: {{ captchareData.ticket }}</p>
    <p>randstr: {{ captchareData.randstr }}</p>
    <p>res: {{ res }}</p>
</template>
