import React, {useState, useEffect} from 'react';
import './App.css';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';
import arweave from './ArweaveSetup';
import {Base64} from 'js-base64';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlay} from '@fortawesome/free-solid-svg-icons'

function App() {
    const [response, setResponse] = useState({});
    const [displayResponse, setDisplayResponse] = useState({});
    const [isExpanded, setExpanded] = useState(true);
    const [isDecodeTags, setDecodeTags] = useState(true);
    const [isDecodeText, setDecodeText] = useState(true);
    const [isRun, setRun] = useState(false);
    const [isCorrectInput, setCorrectInput] = useState(true);
    const [placeholder, setPlaceholder] = useState({
        op: "and",
        expr1: {
            op: "equals",
            expr1: "from",
            expr2: "wp3Dg9cOPxf4XWSRw4EdA5_bMaT4XVdSPU0KUdvI4-Y"
        },
        expr2: {
            op: "equals",
            expr1: "weave-type",
            expr2: "post"
        }
    });

    const onRunCode = async () => {
        setRun(true);
        setDisplayResponse({});
        setResponse({});
        try {
            let result = await arweave.arql(placeholder);
            setResponse(result);
        } catch (e) {
            alert('Incorrect request');
        }

        setRun(false);
    };

    useEffect(() => {
        async function updateInfo() {
            await updateResponse();
        }

        let res = updateInfo();
    }, [response]);

    const updateResponse = async () => {
        if (!Array.isArray(response) || response.length === 0) {
            return;
        }

        let result = [...response];
        if (isExpanded) {
            setRun(true);
            result = await Promise.all(result.map(txid => arweave.transactions.get(txid)));

            if (isDecodeTags) {
                result = await Promise.all(result.map(transaction => {
                    const tags = transaction.tags.map(tag => {
                        let name = tag.name;
                        try {
                            name = Base64.decode(name);
                        } catch (e) {
                            console.log(e);
                        }

                        let value = tag.value;
                        try {
                            value = Base64.decode(value);
                        } catch (e) {
                            console.log(e);
                        }

                        return {name, value};
                    });

                    return {...transaction, tags};
                }));

            }

            if (isDecodeText) {
                result = await Promise.all(result.map(transaction => {
                    let result = transaction.data;
                    try {
                        result = Base64.decode(transaction.data);
                    } catch (e) {
                    }

                    return {...transaction, data: result};
                }));
            }

            setRun(false);
        } else {
            result = response;
        }

        setDisplayResponse(result);
    };

    return (
        <React.Fragment>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <span className="navbar-brand">ArQL Explorer</span>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor01"
                        aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"/>
                </button>
            </nav>

            <div className="container" style={{marginTop: 20}}>
                <div className="row">
                    <div className="col-sm-6">
                        <h3>Request</h3>

                        <div className="pre-window">
                            <button className="btn btn-success" onClick={onRunCode} disabled={isRun || !isCorrectInput}>
                                <FontAwesomeIcon icon={faPlay}/>&nbsp;
                                Run{isRun ? '...' : ''}
                            </button>
                        </div>

                        <JSONInput
                            id='a_unique_id'
                            placeholder={placeholder}
                            theme={'light_mitsuketa_tribute'}
                            locale={locale}
                            onChange={_ => {
                                if (_.error) {
                                    setCorrectInput(false);
                                } else {
                                    setCorrectInput(true);
                                    setPlaceholder(_.jsObject);
                                }
                            }}
                        />
                    </div>
                    <div className="col-sm-6">
                        <h3>Response</h3>
                        <div className="pre-window">
                            <div className="form-check form-check-inline">
                                <input id="checkbox-expanded" type="checkbox" className="form-check-input"
                                       checked={isExpanded}
                                       onChange={event => setExpanded(event.target.checked)}/>
                                <label className="form-check-label" htmlFor="checkbox-expanded">Expanded info</label>
                            </div>

                            <div className="form-check form-check-inline">
                                <input id="checkbox-tags" type="checkbox" className="form-check-input"
                                       disabled={!isExpanded}
                                       checked={isDecodeTags}
                                       onChange={event => setDecodeTags(event.target.checked)}/>
                                <label className="form-check-label" htmlFor="checkbox-tags">Decode tags</label>
                            </div>

                            <div className="form-check form-check-inline">
                                <input id="checkbox-text" type="checkbox" className="form-check-input"
                                       disabled={!isExpanded}
                                       checked={isDecodeText}
                                       onChange={event => setDecodeText(event.target.checked)}/>
                                <label className="form-check-label" htmlFor="checkbox-text">Decode data</label>
                            </div>
                        </div>
                        <JSONInput
                            id='a_unique_id_1'
                            placeholder={displayResponse}
                            theme={'light_mitsuketa_tribute'}
                            locale={locale}
                            viewOnly={true}
                        />
                    </div>
                </div>
                <p>ArQL docs: <a
                    target="_blank"
                    href="https://github.com/ArweaveTeam/arweave-js#arql">https://github.com/ArweaveTeam/arweave-js#arql</a>
                </p>
            </div>
        </React.Fragment>
    );
}

export default App;
