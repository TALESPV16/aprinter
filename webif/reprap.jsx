
// Constants

var statusRefreshInterval = 2000;
var controlTableClass = 'table table-condensed table-striped control-table';
var controlInputClass = 'form-control control-input';
var controlButtonClass = function(type) { return 'btn btn-'+type+' control-button'; }

// Utility functions

function orderObject(obj) {
    var arr = $.map(obj, function(val, key) { return {key: key, val: val}; });
    arr.sort(function(x, y) { return (x.key > y.key) - (x.key < y.key); });
    return arr;
}

function getNumberInput(input) {
    return $.trim(input.value) - 0;
}

function showError(error_str) {
    console.log('ERROR: '+error_str);
}

function $has(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

// Main React classes

var AxesTable = React.createClass({
    axisGo: function(axis_name) {
        var target = getNumberInput(this.refs['target_'+axis_name]);
        if (isNaN(target)) {
            return showError('Target value for axis '+axis_name+' is incorrect');
        }
        sendGcode('G0 R '+axis_name+target.toString());
        this.axisCancel(axis_name);
    },
    axisCancel: function(axis_name) {
        delete goto_state[axis_name];
        axes_wrapper.forceUpdate();
    },
    axisUpdateGoto: function(axis_name) {
        goto_state[axis_name] = this.refs['target_'+axis_name].value;
        axes_wrapper.forceUpdate();
    },
    render: function() { return (
        <table className={controlTableClass}>
            <colgroup>
                <col span="1" style={{width: '55px'}} />
                <col span="1" style={{width: '115px'}} />
                <col span="1" />
                <col span="1" style={{width: '205px'}} />
            </colgroup>
            <thead>
                <tr>
                    <th>Axis</th>
                    <th>Position (planned)</th>
                    <th></th>
                    <th>Go to</th>
                </tr>
            </thead>
            <tbody>
                {$.map(orderObject(this.props.axes), function(axis) {
                    var btnExtraStyle = '';
                    var inputValue = axis.val.pos;
                    if ($has(this.props.goto, axis.key)) {
                        btnExtraStyle = ' control-editing';
                        inputValue = this.props.goto[axis.key];
                    }
                    return (
                        <tr key={axis.key}>
                            <td><b>{axis.key}</b></td>
                            <td>{axis.val.pos.toPrecision(6)}</td>
                            <td></td>
                            <td>
                                <div className="input-group">
                                    <input type="number" className={controlInputClass+btnExtraStyle} value={inputValue} ref={'target_'+axis.key}
                                           onInput={this.axisUpdateGoto.bind(this, axis.key)} onChange={this.axisUpdateGoto.bind(this, axis.key)} />
                                    <span className="input-group-btn">
                                        <button type="button" className={controlButtonClass('warning')} onClick={this.axisGo.bind(this, axis.key)}>Go</button>
                                        <button type="button" className={controlButtonClass('primary')} onClick={this.axisCancel.bind(this, axis.key)} aria-label="Cancel">
                                            <span className="glyphicon glyphicon-remove" style={{verticalAlign: 'middle', marginTop: '-0.1em'}} aria-hidden="true"></span>
                                        </button>
                                    </span>
                                </div>
                            </td>
                        </tr>
                    );
                }.bind(this))}
            </tbody>
        </table>
    );}
});

var HeatersTable = React.createClass({
    heaterSet: function(heater_name) {
        var target = getNumberInput(this.refs['target_'+heater_name]);
        if (isNaN(target)) {
            return showError('Target value for heater '+heater_name+' is incorrect');
        }
        sendGcode('M104 F '+heater_name+' S'+target.toString());
    },
    heaterOff: function(heater_name) {
        sendGcode('M104 F '+heater_name+' Snan');
    },
    render: function() { return (
        <table className={controlTableClass}>
            <colgroup>
                <col span="1" style={{width: '55px'}} />
                <col span="1" style={{width: '78px'}} />
                <col span="1" />
                <col span="1" style={{width: '183px'}} />
            </colgroup>
            <thead>
                <tr>
                    <th>Heater</th>
                    <th>Actual [C]</th>
                    <th>Target [C]</th>
                    <th>Control [C]</th>
                </tr>
            </thead>
            <tbody>
                {$.map(orderObject(this.props.heaters), function(heater) { return (
                    <tr key={heater.key}>
                        <td><b>{heater.key}</b></td>
                        <td>{heater.val.current.toPrecision(4)}</td>
                        <td>{((heater.val.target < -1000) ? "off" : heater.val.target.toPrecision(4)) + (heater.val.error ? " ERR" : "")}</td>
                        <td>
                            <div className="input-group">
                                <input type="number" className={controlInputClass} defaultValue="220" ref={'target_'+heater.key} />
                                <span className="input-group-btn">
                                    <button type="button" className={controlButtonClass('warning')} onClick={this.heaterSet.bind(this, heater.key)}>Set</button>
                                    <button type="button" className={controlButtonClass('primary')} onClick={this.heaterOff.bind(this, heater.key)}>Off</button>
                                </span>
                            </div>
                        </td>
                    </tr>
                );}.bind(this))}
            </tbody>
        </table>
    );}
});

var FansTable = React.createClass({
    fanSet: function(fan_name) {
        var target = getNumberInput(this.refs['target_'+fan_name]);
        if (isNaN(target)) {
            return showError('Target value for fan '+fan_name+' is incorrect');
        }
        sendGcode('M106 F '+fan_name+' S'+(target/100*255).toPrecision(6));
    },
    fanOff: function(fan_name) {
        sendGcode('M106 F '+fan_name+' S0');
    },
    render: function() { return (
        <table className={controlTableClass}>
            <colgroup>
                <col span="1" style={{width: '55px'}} />
                <col span="1" style={{width: '83px'}} />
                <col span="1" />
                <col span="1" style={{width: '183px'}} />
            </colgroup>
            <thead>
                <tr>
                    <th>Fan</th>
                    <th>Target [%]</th>
                    <th></th>
                    <th>Control [%]</th>
                </tr>
            </thead>
            <tbody>
                {$.map(orderObject(this.props.fans), function(fan) { return (
                    <tr key={fan.key}>
                        <td><b>{fan.key}</b></td>
                        <td>{(fan.val.target === 0) ? "off" : (fan.val.target * 100).toPrecision(3)}</td>
                        <td></td>
                        <td>
                            <div className="input-group">
                                <input type="number" className={controlInputClass} defaultValue="100" ref={'target_'+fan.key} />
                                <span className="input-group-btn">
                                    <button type="button" className={controlButtonClass('warning')} onClick={this.fanSet.bind(this, fan.key)}>Set</button>
                                    <button type="button" className={controlButtonClass('primary')} onClick={this.fanOff.bind(this, fan.key)}>Off</button>
                                </span>
                            </div>
                        </td>
                    </tr>
                );}.bind(this))}
            </tbody>
        </table>
    );}
});

var SpeedTable = React.createClass({
    speedRatioSet: function() {
        var target = getNumberInput(this.refs.target);
        if (isNaN(target)) {
            return showError('Speed ratio value is incorrect');
        }
        sendGcode('M220 S'+target.toPrecision(6));
    },
    speedRatioReset: function() {
        sendGcode('M220 S100');
    },
    render: function() { return (
        <table className={controlTableClass}>
            <colgroup>
                <col span="1" style={{width: '83px'}} />
                <col span="1" />
                <col span="1" style={{width: '190px'}} />
            </colgroup>
            <thead>
                <tr>
                    <th>Speed ratio [%]</th>
                    <th></th>
                    <th>Control [%]</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{(this.props.speedRatio*100).toPrecision(3)}</td>
                    <td></td>
                    <td>
                        <div className="input-group">
                            <input type="number" className={controlInputClass} defaultValue="100" ref="target" />
                            <span className="input-group-btn">
                                <button type="button" className={controlButtonClass('warning')} onClick={this.speedRatioSet}>Set</button>
                                <button type="button" className={controlButtonClass('primary')} onClick={this.speedRatioReset}>Reset</button>
                            </span>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    );}
});

var Buttons1 = React.createClass({
    render: function() { return (
        <div>
            <button type="button" className="btn btn-primary top-btn-margin" onClick={onBtnHomeAxes}>Home axes</button>
            {this.props.probe_present &&
            <button type="button" className="btn btn-primary top-btn-margin" onClick={onBtnBedProbing}>Bed probing</button>
            }
            <button type="button" className="btn btn-info top-btn-margin" onClick={onBtnMotorsOff}>Motors off</button>
        </div>
    );}
});

var Buttons2 = React.createClass({
    render: function() { return (
        <div>
            <button type="button" className="btn btn-info top-btn-margin" onClick={onBtnRefresh}>Refresh</button>
        </div>
    );}
});


// Gluing of react classes into page

var ComponentWrapper = React.createClass({
    render: function() {
        return this.props.render();
    }
});

var machine_state = {
    speedRatio: 1,
    axes: {},
    heaters: {},
    fans: {}
};

var goto_state = {};

function render_axes() {
    return <AxesTable axes={machine_state.axes} goto={goto_state} />;
}
function render_heaters() {
    return <HeatersTable heaters={machine_state.heaters} />;
}
function render_fans() {
    return <FansTable fans={machine_state.fans} />;
}
function render_speed() {
    return <SpeedTable speedRatio={machine_state.speedRatio} />;
}
function render_buttons1() {
    return <Buttons1 probe_present={$has(machine_state, 'bedProbe')} />;
}
function render_buttons2() {
    return <Buttons2 />;
}

var axes_wrapper     = ReactDOM.render(<ComponentWrapper render={render_axes} />,     document.getElementById('axes_div'));
var heaters_wrapper  = ReactDOM.render(<ComponentWrapper render={render_heaters} />,  document.getElementById('heaters_div'));
var fans_wrapper     = ReactDOM.render(<ComponentWrapper render={render_fans} />,     document.getElementById('fans_div'));
var speed_wrapper    = ReactDOM.render(<ComponentWrapper render={render_speed} />,    document.getElementById('speed_div'));
var buttons1_wrapper = ReactDOM.render(<ComponentWrapper render={render_buttons1} />, document.getElementById('buttons1_div'));
var buttons2_wrapper = ReactDOM.render(<ComponentWrapper render={render_buttons2} />, document.getElementById('buttons2_div'));

function updateAll() {
    axes_wrapper.forceUpdate();
    heaters_wrapper.forceUpdate();
    fans_wrapper.forceUpdate();
    speed_wrapper.forceUpdate();
    buttons1_wrapper.forceUpdate();
    buttons2_wrapper.forceUpdate();
}

// Status updating

var statusRequestInProgesss = false;
var statusNeedsAnotherUpdate = false;
var statusTimerId = null;

function accelerateStatusUpdate() {
    if (statusRequestInProgesss) {
        statusNeedsAnotherUpdate = true;
    } else {
        requestStatus();
    }
}

function requestStatus() {
    if (statusTimerId !== null) {
        clearTimeout(statusTimerId);
        statusTimerId = null;
    }
    statusRequestInProgesss = true;
    $.ajax({
        url: '/rr_status',
        dataType: 'json',
        cache: false,
        success: function(new_machine_state) {
            statusRequestCompleted();
            machine_state = new_machine_state;
            updateAll();
        },
        error: function(xhr, status, err) {
            console.error('/rr_status', status, err.toString());
            statusRequestCompleted();
        }
    });
}

function statusRequestCompleted() {
    statusRequestInProgesss = false;
    if (statusNeedsAnotherUpdate) {
        statusNeedsAnotherUpdate = false;
        requestStatus();
    } else {
        statusTimerId = setTimeout(statusTimerHandler, statusRefreshInterval);
    }
}

function statusTimerHandler() {
    if (!statusRequestInProgesss) {
        requestStatus();
    }
}


// Gcode execution

var gcodeQueue = [];

function sendGcode(gcode_str) {
    gcodeQueue.push(gcode_str);
    if (gcodeQueue.length === 1) {
        sendNextQueuedGcode();
    }
}

function sendNextQueuedGcode() {
    var gcode_str = gcodeQueue[0];
    console.log('>>> '+gcode_str);
    $.ajax({
        url: '/rr_gcode',
        type: 'POST',
        data: gcode_str + '\n',
        dataType: 'text',
        success: function(response) {
            console.log('<<< '+response);
            currentGcodeCompleted();
            accelerateStatusUpdate();
        },
        error: function(xhr, status, err) {
            console.error('/rr_gcode', status, err.toString());
            currentGcodeCompleted();
            showError('Error sending gcode: '+gcode_str);
        }
    });
}

function currentGcodeCompleted() {
    gcodeQueue.shift();
    if (gcodeQueue.length !== 0) {
        sendNextQueuedGcode();
    }
}


// Handlers for buttons.

function onBtnHomeAxes() {
    sendGcode('G28');
}

function onBtnBedProbing() {
    sendGcode('G32');
}

function onBtnMotorsOff() {
    sendGcode('M18');
}

function onBtnRefresh() {
    accelerateStatusUpdate();
}


// Initial actions

requestStatus();
