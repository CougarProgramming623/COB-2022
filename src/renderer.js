console.log("Started renderer.js")

ipc.send('connect', "10.6.23.2"); // connect to localhost -- 10.6.23.2

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
    bar: "/COB/bar",
    navXReset: "/COB/navXReset",
    robotAngle: "/COB/robotAngle",
    flywheelRPM: "/COB/flywheelRPM",
    driveMode: "/COB/driveMode",
} // put all the keys here, and match the schema with the COB.h file in the codebase



/*COB.setListener(COB_KEY.foo, value => { document.getElementById("foo-value").innerText = value; })
COB.setListener(COB_KEY.bar, value => { document.getElementById("bar-value").innerText = value; })*/

COB.setListener(COB_KEY.robotAngle, value => { 
    document.getElementById("navX-reset").style.transform = 'rotate(' + value + 'deg)'; 
})
COB.setListener(COB_KEY.flywheelRPM, value => { 
    document.getElementById("flywheelRPM").innerHTML = value + " RPM"; 
})
COB.setListener(COB_KEY.driveMode, value => { 
    document.getElementById("driveMode").innerHTML = value; 
})



function initAll(){
    COB.set(COB_KEY.navXReset, false);
    COB.set(COB_KEY.robotAngle, 0);
    COB.set(COB_KEY.flywheelRPM, 0);
    COB.set(COB_KEY.driveMode, 'Robot Oriented');
}


window.onload = () => { // this runs after the DOM has loaded
    /*document.getElementById("incr-foo").onclick = function() {
        COB.set(COB_KEY.foo, COB.get(COB_KEY.foo, 0) + 1);
    }*/

    initAll();

    document.getElementById("navX-reset").onclick = function() {
        COB.set(COB_KEY.robotAngle, 0.00);
        COB.set(COB_KEY.navXReset, true);
    }
}