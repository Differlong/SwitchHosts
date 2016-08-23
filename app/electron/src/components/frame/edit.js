/**
 * @author oldj
 * @blog http://oldj.net
 */

'use strict';

import React from 'react';
import Frame from './frame';
import './edit.less';

export default class EditPrompt extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false,
            add: true,
            where: 'local',
            title: '',
            url: '',
            last_refresh: null,
            refresh_interval: 0
        };
    }

    tryToFocus() {
        let el = this.refs.body && this.refs.body.querySelector('input[type=text]');
        el && el.focus();
    }

    componentDidMount() {
        SH_event.on('add_host', () => {
            this.setState({
                show: true,
                add: true
            });
            setTimeout(() => {
                this.tryToFocus();
            }, 100);
        });

        SH_event.on('edit_host', (host) => {
            this.setState({
                show: true,
                add: false,
                where: host.where || 'local',
                title: host.title || '',
                url: host.url || '',
                last_refresh: host.last_refresh || null,
                refresh_interval: host.refresh_interval || 0
            });
            setTimeout(() => {
                this.tryToFocus();
            }, 100);
        });
    }

    onOK() {
        this.setState({
            title: (this.state.title || '').replace(/^\s+|\s+$/g, ''),
            url: (this.state.url || '').replace(/^\s+|\s+$/g, '')
        });

        if (this.state.title === '') {
            this.refs.title.focus();
            return false;
        }
        if (this.state.where === 'remote' && this.state.url === '') {
            this.refs.url.focus();
            return false;
        }

        SH_event.emit('host_' + (this.state.add ? 'add' : 'edit'), Object.assign({
            content: `# ${this.state.title}`
        }, this.state));

        this.setState({
            show: false
        });
    }

    onCancel() {
        this.setState({
            show: false
        });
    }

    static getRefreshOptions() {
        let k = [
            [0, `${SH_Agent.lang.never}`],
            [1, `1 ${SH_Agent.lang.hour}`],
            [24, `24 ${SH_Agent.lang.hours}`],
            [168, `7 ${SH_Agent.lang.days}`]
        ];
        return k.map(([v, n], idx) => {
            return (
                <option value={v} key={idx}>{n}</option>
            );
        });
    }

    renderRemoteInputs() {
        if (this.state.where !== 'remote') return null;

        return (
            <div className="remote-ipts">
                <div className="ln">
                    <div className="title">{SH_Agent.lang.url}</div>
                    <div className="cnt">
                        <input
                            type="text"
                            ref="url"
                            value={this.state.url}
                            placeholder="http://"
                            onChange={(e) => this.setState({url: e.target.value})}
                        />
                    </div>
                </div>
                <div className="ln">
                    <div className="title">{SH_Agent.lang.auto_refresh}</div>
                    <div className="cnt">
                        <select
                            value={this.state.refresh_interval}
                            onChange={(e) => this.setState({refresh_interval: parseInt(e.target.value) || 0})}
                        >
                            {EditPrompt.getRefreshOptions()}
                        </select>

                        <span className="last-refresh">
                            {SH_Agent.lang.last_refresh}
                            {this.state.last_refresh || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    body() {
        return (
            <div ref="body">
                <div className="ln">
                    <input id="ipt-local" type="radio" name="where" value="local"
                           checked={this.state.where === 'local'}
                           onChange={(e) => this.setState({where: e.target.value})}
                    />
                    <label htmlFor="ipt-local">{SH_Agent.lang.where_local}</label>
                    <input id="ipt-remote" type="radio" name="where" value="remote"
                           checked={this.state.where === 'remote'}
                           onChange={(e) => this.setState({where: e.target.value})}
                    />
                    <label htmlFor="ipt-remote">{SH_Agent.lang.where_remote}</label>
                </div>
                <div className="ln">
                    <div className="title">{SH_Agent.lang.host_title}</div>
                    <div className="cnt">
                        <input
                            type="text"
                            ref="title"
                            name="text"
                            value={this.state.title}
                            onChange={(e) => this.setState({title: e.target.value})}
                        />
                    </div>
                </div>
                {this.renderRemoteInputs()}
            </div>
        )
    }

    render() {
        return (
            <Frame
                show={this.state.show}
                head={SH_Agent.lang[this.state.add ? 'add_host' : 'edit_host']}
                body={this.body()}
                onOK={() => this.onOK()}
                onCancel={() => this.onCancel()}
            />
        );
    }
}
