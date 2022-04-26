<template>
  <div class="container">
    <h1>
      <a href="https://github.com/meyt/vue-datewheel" target="_blank">vue-datewheel demo</a>
    </h1>
    <div class="card">
      <div class="block">
        <h3>Basic</h3>
        <examples-basic />
      </div>

      <div class="block">
        <h3>Locale</h3>
        <examples-locale />
      </div>

      <div class="block">
        <h3>Calendar</h3>
        <p>
          You can use any calendar
          <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/calendars">
            supported by the browser.
          </a>
        </p>
        <examples-calendar />
      </div>


      <div class="block">
        <h3>Layout</h3>
        <examples-layout />
      </div>

    </div>
  </div>
</template>
<style>
  html, body{
    margin: 0;
    padding: 0;
    background: #eee;
  }
  .container {
    width: 550px;
    max-width: 100%;
    margin: 0 auto;
    position: relative;
    box-sizing: border-box;
    overflow: hidden;
    padding-bottom: 16px;
  }
  .card {
    background: #fff;
    position: relative;
    padding: 16px;
    border-radius: 4px;
  }
  .contained-vertical {
    width: 250px;
    height: 300px;
    position: relative;
  }
  .contained-horizontal {
    width: 350px;
    height: 150px;
    position: relative;
  }
  textarea {
    color: #000;
    border: none;
    background: #eee;
    width: 100%;
    padding: 8px;
    outline: 0;
    height: auto;
    resize: none;
    overflow: hidden;
    font-size: 11px;
    box-sizing: border-box;
  }
  .watermark {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 20%;
    height: auto;
    pointer-events: none;
    user-select: none;
    display: block;
    opacity: 0.7;
  }
  a {
    text-decoration: none;
  }
  h1 {
    color: #555;
    text-align: center;
  }

  pre {
    display: block;
    width: 100%;
    background-color: #eee;
    text-align: left;
    font-family: monospace;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 10px;
    font-size: 11px;
    word-break: break-all;
    white-space: pre-wrap;
    box-sizing: border-box;
  }
</style>
