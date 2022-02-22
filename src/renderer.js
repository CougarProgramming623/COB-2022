console.log("Started renderer.js")

ipc.send('connect', "127.0.0.1"); // connect to robot: 10.6.23.2 || self: 127.0.0.1

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

NetworkTables.getValue()
// rapid react specific code follows

const COB_KEY = {
    navXReset: "/COB/navXReset",
    robotAngle: "/COB/robotAngle",
    flywheelSpeed: "/COB/flywheelSpeed",
    driveMode: "/COB/driveMode",
    matchTime: "/COB/matchTime",
    matchColor: "/FMSInfo/IsRedAlliance"
} // put all the keys here, and match the schema with the COB.h file in the codebase



/*COB.setListener(COB_KEY.foo, value => { document.getElementById("foo-value").innerText = value; })
COB.setListener(COB_KEY.bar, value => { document.getElementById("bar-value").innerText = value; })*/

COB.setListener(COB_KEY.robotAngle, value => { 
    document.getElementById("robotAngle").innerText = Math.trunc(value).toString() + "°" ; 
    document.getElementById("arrow").style.transform = 'rotate(' + value + 'deg)'; 
})

let deg = 0;
COB.setListener(COB_KEY.flywheelSpeed, value => { 
    deg = deg + value;
    document.getElementById("flywheelRPM").innerText = Math.trunc(value).toString() + " RPM";
    document.getElementById("flywheelDisplay").style.transform = 'rotate(' + ((deg / 10) % 360) + 'deg)'; 
    
})
COB.setListener(COB_KEY.driveMode, value => { 
    document.getElementById("driveMode").innerText = value; 
})
COB.setListener(COB_KEY.matchTime, value => { 
    let format = ":";
    if (Math.trunc(value - (Math.trunc(value / 60) * 60)) < 10) format = ":0";

    document.getElementById("timer").innerText = (Math.trunc(value / 60)).toString() + format + Math.trunc(value - (Math.trunc(value / 60) * 60)).toString(); //displays time in Min:Sec format

    let phase;
    if (value > 135) { 
        phase = "Autonomous";
    } else if (value > 30) {
        phase = "Tele-Op";
    } else if (value <= 30) {
        phase = "Endgame";
    }

    document.getElementById("matchPhase").innerText = phase;
})

COB.setListener(COB_KEY.matchColor, value => { 
    if(value) {
        document.getElementById("arrow").src = "./images/RedArrow.png"
    } else {
        document.getElementById("arrow").src = "./images/BlueArrow.png"
    }
})


function initAll(){
    COB.set(COB_KEY.navXReset, false);
    COB.set(COB_KEY.robotAngle, 0);
    COB.set(COB_KEY.flywheelSpeed, 0);
    COB.set(COB_KEY.driveMode, 'Robot Oriented');
    COB.set(COB_KEY.matchTime, 150);
    COB.set(COB_KEY.matchPhase, "Phase: Match Not Started");
}


window.onload = () => { // this runs after the DOM has loaded
    /*document.getElementById("incr-foo").onclick = function() {
        COB.set(COB_KEY.foo, COB.get(COB_KEY.foo, 0) + 1);
    }*/

    initAll();

    document.getElementById("arrow").onclick = function() {
        COB.set(COB_KEY.robotAngle, 0.00);
        COB.set(COB_KEY.navXReset, true);
    }
}