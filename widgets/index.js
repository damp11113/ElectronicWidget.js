const widgets = {};

// Dynamically import all widgets in this folder
const context = require.context('./', true, /\.js$/);
context.keys().forEach((key) => {
    const widgetName = key.replace('./', '').replace('.js', '');
    widgets[widgetName] = context(key).default || context(key);
});

module.exports = widgets;
