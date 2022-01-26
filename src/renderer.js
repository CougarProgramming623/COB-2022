console.log("Started renderer.js")

ipc.send('connect', "localhost"); // connect to localhost

const COB = {
    set: function(cobKey, value) {
        NetworkTables.putValue(cobKey, value);
    },
    get: function(cobKey, def) {
        return NetworkTables.getValue(cobKey, def);
    },
    // key: the key to use
    // f: (newValue, isNew) => ...
    setListener: function(key, f) {
        NetworkTables.addKeyListener(key, (newKey, newValue, isNew) => f(newValue, isNew), true);
    }
}

NetworkTables.addRobotConnectionListener((con) => { console.log("connected", con) }, false);


// rapid react specific code follows

const COB_KEY = {
    foo: "/COB/foo",
    bar: "/COB/bar"
} // put all the keys here, and match the schema with the COB.h file in the codebase



COB.setListener(COB_KEY.foo, value => { document.getElementById("foo-value").innerText = value; })
COB.setListener(COB_KEY.bar, value => { document.getElementById("bar-value").innerText = value; })


window.onload = () => { // this runs after the DOM has loaded

    document.getElementById("incr-foo").onclick = function() {
        COB.set(COB_KEY.foo, COB.get(COB_KEY.foo, 0) + 1);
    }
}