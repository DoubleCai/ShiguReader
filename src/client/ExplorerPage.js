// @flow
import React, { Component } from 'react';
import _ from "underscore";
import PropTypes from 'prop-types';
import LoadingImage from './LoadingImage';
import folderIcon from './images/folder.png';
import Sender from './Sender';
import { Switch, Route, Link } from 'react-router-dom'

export default class ExplorerPage extends Component {
    constructor(prop) {
        super(prop);
        this.state = { hasError: false };
    }

    onFileCilck(value) {
        if (_.isCompress(value)) {
            this.props.openBookFunc(value);
        }
    }

    getTableRow(image, item, isFolder) {
    // var fn = path.basename(item, path.extname(item));
        let func = isFolder ? this.displayPath : this.onFileCilck;
        func = func.bind(this, item);

        const text = this.props.PathForExplorer? _.getFn(item): item;
        const result =  (
            <li
                type="button"
                className="list-group-item btn btn-primary home-row"
                key={item}
                onClick={func}
            >
                {image}
                <span className="row-file-name">{text}</span>
            </li>
        );

        if(isFolder){
            return result;
        }else {
            return <Link to='/onebook'  key={item}>{result}</Link>
        }
    }

    displayPath(dir) {
        Sender.lsDir({ dir }, res => {
            if (!res.failed) {
                this.props.openDirFunc(dir, res.dirs, res.files);
            }
        });
    }

    renderFileList() {
        const {
            res, failed
        } = this.state;

        const {
            dirs, files
        } = this.props;

        if (failed || (res && res.status !== 200)) {
            return (
                <div className="alert alert-danger" role="alert">The server is down. Please check.</div>
            );
        } else if (_.isEmpty(dirs) && _.isEmpty(files)) {
            return (
                <div className="alert alert-info" role="alert">Loading...</div>
            );
        }

        //! todo when there is >6000 files, does not need to render all  list
        const dirItems = dirs.map((item) => this.getTableRow(<img className="row-thumbnail-image" src={folderIcon} alt="folder-thumbnail"/>, item, "isDir"));
        //! !todo if the file is already an image file
        const zipfileItems = files.filter(_.isCompress).map((item) => this.getTableRow(<LoadingImage className="row-thumbnail-image row-thumbnail-file-image" fileName={item} />, item));
        return (
            <ul className="list-group">
                {dirItems}
                {zipfileItems}
            </ul>
        );
    }

    componentDidCatch(error) {
        // Display fallback UI
        console.error(error);
        this.setState({ hasError: true });
    }

    render() {
        const { hasError } = this.state;
        if (hasError) {
            // You can render any custom fallback UI
            return <h1>Something went wrong.</h1>;
        }
        return (
            <div className="home-container">
                {this.renderFileList()}
            </div>
        );
    }
}

ExplorerPage.propTypes = {
    PathForExplorer: PropTypes.string,
    dirs: PropTypes.array,
    files: PropTypes.array,
    openBookFunc: PropTypes.func,
    openDirFunc: PropTypes.func,
};
