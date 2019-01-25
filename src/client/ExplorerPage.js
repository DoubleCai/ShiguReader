// @flow
import React, { Component } from 'react';
import _ from "underscore";
import './style/Explorer.scss';
import PropTypes from 'prop-types';
import LoadingImage from './LoadingImage';
import folderIcon from './images/folder.png';
import Sender from './Sender';
import { Link } from 'react-router-dom';
import stringHash from "string-hash";
const userConfig = require('../user-config');
import ErrorPage from './ErrorPage';

export default class ExplorerPage extends Component {
    constructor(prop) {
        super(prop);
    }
    
    getHash() {
        return this.props.match.params.tag || this.props.match.params.number;
    }

    getMode(){
        if(this.props.match.params.tag){
            return "tag"
        }else{
            return "explorer";
        }
    }

    componentDidMount() {
        const hash = this.getHash();
        if (hash && this.loadedHash !== hash) {
            if(this.getMode() === "tag"){
                this.requestTagSearch();
            }else{
                this.requestLsDir();
            }
        }
    }
    
    componentDidUpdate() {
        this.componentDidMount();
    }

    requestTagSearch(tag) {
        Sender.post("/api/tagSearch", { hash: this.getHash() }, res => {
            if (!res.failed) {
                this.loadedHash = this.getHash();
                this.files = res.tagFiles|| [];
                this.dirs = [];
                this.tag = res.tag;
                this.forceUpdate();
                this.res = res;
              }else{
                this.res = res;
                this.forceUpdate();
              }
        });
    }
    
    requestLsDir() {
        Sender.lsDir({ hash: this.getHash() }, res => {
            if (!res.failed) {
                const {dirs, files, path} = res;
                this.files = files|| [];
                this.dirs = dirs||[];
                this.path = path;
                this.loadedHash = this.getHash();
                this.forceUpdate();
            } else {
                this.res = res;
                this.forceUpdate();
            }
        });
    }
    
    renderFileList() {
        let dirs, files;
        if(!this.getHash()) {
            dirs = userConfig.home_pathes;
            files = [];
        } else {
            dirs = this.dirs;
            files = this.files;
        }
        
        if (_.isEmpty(dirs) && _.isEmpty(files)) {
            if(this.res){
                return (<div className="explorer-page-loading">
                {<Spinner />}
                { "Loading..."}
              </div>);
            }else{
                return <center className="">Empty Folder</center>;
            }
        } 
        
        //! todo when there is >6000 files, does not need to render all  list
        const dirItems = dirs.map((item) =>  {
            const text =  _.getFn(item);
            const pathHash = stringHash(item);
            const toUrl =('/explorer/'+ pathHash);
            const result =  (
                <li className="explorer-dir-list-item" key={item}>
                <i className="far fa-folder"></i>
                <span className="explorer-dir-list-item">{item}</span>
                </li>
            );
            return  <Link to={toUrl}  key={item}>{result}</Link>;
        });
        //! !todo if the file is already an image file
        const zipfileItems = files.filter(_.isCompress).map((item) => {
            const text = _.getFn(item);
            const pathHash = stringHash(item);
            const toUrl =  '/onebook/' + pathHash;
            return (<div key={item} className="col-sm-6 col-md-4 col-lg-3 file-out-cell">
                        <Link to={toUrl}  key={item} className="file-cell">
                        <center className="file-cell-title">{text}</center>
                        <LoadingImage className="file-cell-thumbnail" fileName={item} />
                        </Link>
                    </div>);
        });

        return (
            <div className="explorer-container">
                <ul className="dir-list container">
                    {dirItems}
                </ul>
                <div className="file-grid container">
                    <div className="row">
                        {zipfileItems}
                    </div>
                </div>
            </div>
        );
    }
    
    isFailedLoading(){
        return this.res && this.res.failed;
    }

    getTitle(){
        const mode = this.getMode();
        if(this.tag && mode === "tag") {
            return "Tag: " + this.tag + " (" + (this.files||[]).length + ")";
        }else if(this.path){
            return "At " + this.path;
        }
    }
    
    render() {
        if (this.isFailedLoading()) {
            return <ErrorPage res={this.res.res}/>;
        }

        return (<div>
            <center className="location-title">{this.getTitle()}</center>
            {this.renderFileList()}
            </div>
        );
    }
}

ExplorerPage.propTypes = {
    dirs: PropTypes.array,
    files: PropTypes.array,
    openBookFunc: PropTypes.func,
    openDirFunc: PropTypes.func,
    cookies: PropTypes.any
};
