import React from "react";


const scheduleForm = React.createClass({

  propTypes: {
    addScheduleSubject: React.PropTypes.object.isRequired,
    addScheduleResult: React.PropTypes.object.isRequired,
    clusterNames: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      addScheduleResultMsg: null, clusterNames: [], submitEnabled: false,
      clusterName: null, keyspace: null, tables: null, owner: null, segments: null,
      parallism: null, intensity: null, startTime: null, intervalDays: null, incrementalRepair: null
    };
  },

  componentWillMount: function() {
    this._scheduleResultSubscription = this.props.addScheduleResult.subscribeOnNext(obs =>
      obs.subscribe(
        r => this.setState({addScheduleResultMsg: null}),
        r => this.setState({addScheduleResultMsg: r.responseText})
      )
    );

    this._clusterNamesSubscription = this.props.clusterNames.subscribeOnNext(obs =>
      obs.subscribeOnNext(names => {
        this.setState({clusterNames: names});
        if(names.length == 1) this.setState({clusterName: names[0]});
      })
    );
  },

  componentWillUnmount: function() {
    this._scheduleResultSubscription.dispose();
    this._clusterNamesSubscription.dispose();
  },

  _onAdd: function(e) {
    const schedule = {
      clusterName: this.state.clusterName, keyspace: this.state.keyspace,
      owner: this.state.owner, scheduleTriggerTime: this.state.startTime,
      scheduleDaysBetween: this.state.intervalDays
    };
    if(this.state.tables) schedule.tables = this.state.tables;
    if(this.state.segments) schedule.segmentCount = this.state.segments;
    if(this.state.parallism) schedule.repairParallelism = this.state.parallism;
    if(this.state.intensity) schedule.intensity = this.state.intensity;
    if(this.state.incrementalRepair){
      schedule.incrementalRepair = this.state.incrementalRepair;
    }
    else{
      schedule.incrementalRepair = "false";
    }

    this.props.addScheduleSubject.onNext(schedule);
  },

  _handleChange: function(e) {
    var v = e.target.value;
    var n = e.target.id.substring(3); // strip in_ prefix

    // update state
    const state = this.state;
    state[n] = v;
    this.replaceState(state);

    // validate
    const valid = state.keyspace && state.clusterName && state.owner
      && state.startTime && state.intervalDays;
    this.setState({submitEnabled: valid});
  },

  render: function() {

    let addMsg = null;
    if(this.state.addScheduleResultMsg) {
      addMsg = <div className="alert alert-danger" role="alert">{this.state.addScheduleResultMsg}</div>
    }

    const clusterItems = this.state.clusterNames.map(name =>
      <option key={name} value={name}>{name}</option>
    );

    const form = <div className="row">
        <div className="col-lg-12">

          <form className="form-horizontal form-condensed">

            <div className="form-group">
              <label htmlFor="in_clusterName" className="col-sm-3 control-label">Cluster*</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <select className="form-control" id="in_clusterName"
                  onChange={this._handleChange} value={this.state.clusterName}>
                  {clusterItems}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="in_keyspace" className="col-sm-3 control-label">Keyspace*</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="text" required className="form-control" value={this.state.keyspace}
                  onChange={this._handleChange} id="in_keyspace" placeholder="name of keyspace to repair"/>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="in_tables" className="col-sm-3 control-label">Tables</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="text" className="form-control" value={this.state.tables}
                  onChange={this._handleChange} id="in_tables" placeholder="table1, table2, table3"/>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="in_owner" className="col-sm-3 control-label">Owner*</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="text" required className="form-control" value={this.state.owner}
                  onChange={this._handleChange} id="in_owner" placeholder="owner name for the schedule (any string)"/>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="in_segments" className="col-sm-3 control-label">Segment count</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="number" className="form-control" value={this.state.segments}
                  onChange={this._handleChange} id="in_segments" placeholder="amount of segments to create for scheduled repair runs"/>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="in_parallism" className="col-sm-3 control-label">Parallism</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <select className="form-control" id="in_parallism"
                  onChange={this._handleChange} value={this.state.parallism}>
                  <option value=""></option>
                  <option value="SEQUENTIAL">Sequential</option>
                  <option value="PARALLEL">Parallel</option>
                  <option value="DATACENTER_AWARE">DC-Aware</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="in_intensity" className="col-sm-3 control-label">Repair intensity</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="number" className="form-control" value={this.state.intensity}
                  onChange={this._handleChange} id="in_intensity" placeholder="repair intensity for scheduled repair runs"/>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="in_startTime" className="col-sm-3 control-label">Start time*</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="datetime-local" required className="form-control"
                  onChange={this._handleChange} value={this.state.startTime} id="in_startTime"/>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="in_intervalDays" className="col-sm-3 control-label">Interval in days*</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="number" required className="form-control" value={this.state.intervalDays}
                  onChange={this._handleChange} id="in_intervalDays" placeholder="amount of days to wait between scheduling new repairs, (e.g. 7 for weekly)"/>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="in_incrementalRepair" className="col-sm-3 control-label">Incremental</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <select className="form-control" id="in_incrementalRepair"
                  onChange={this._handleChange} value={this.state.incrementalRepair}>
                  <option value="false">false</option>
                  <option value="true">true</option>                  
                </select>
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-offset-3 col-sm-9">
                <button type="button" className="btn btn-success" disabled={!this.state.submitEnabled}
                  onClick={this._onAdd}>Add Schedule</button>
              </div>
            </div>
          </form>

      </div>
    </div>


    return (<div className="panel panel-default">
              <div className="panel-heading">
                <div className="panel-title">Add schedule</div>
              </div>
              <div className="panel-body">
                {addMsg}
                {form}
              </div>
            </div>);
  }
});

export default scheduleForm;
