import React, {useState, useEffect} from 'react';
import './App.css';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';
import arweave from './ArweaveSetup';
import md5 from 'md5';
import Immutable from 'seamless-immutable';
import Base64 from 'js-base64';

function App() {
    const [response, setResponse] = useState({});
    const [displayResponse, setDisplayResponse] = useState({});
    const [isExpanded, setExpanded] = useState(true);
    const [isDecodeTags, setDecodeTags] = useState(true);
    const [isDecodeText, setDecodeText] = useState(true);
    const [cache, setCache] = useState({});
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
        setResponse({});
        let result = await arweave.arql(placeholder);
        setResponse(result);
    };

    useEffect((data, data1) => {
        console.log(11111);

        async function updateInfo() {
            await updateResponse();
        }

        let res = updateInfo();
    }, [response]);

    const updateResponse = async (isCache = true) => {
        console.log(cache);
        if (!Array.isArray(response) || response.length === 0) {
            return;
        }

        let txs = response;
        let result = Immutable();
        if (isExpanded) {
            const hash = md5(JSON.stringify(placeholder));
            if (isCache) {
                txs = cache[hash] ? Immutable(cache[hash]) : txs;
            }

            if ((isCache && !cache[hash]) || !isCache) {
                console.log(isCache, hash, cache[hash]);
                txs = await Promise.all(txs.map(txid => arweave.transactions.get(txid)));
                console.log(txs);
                cache[hash] = Immutable(txs);
                console.log(cache[hash]);
                //alert('start - ' + cache[hash][0].tags[0].name);
            }

            result = Immutable(txs);
            if (isDecodeTags) {
                console.log(result);
                result = await Promise.all(result.map(transaction => {
                    console.log(transaction);
                    const tags = transaction.tags.map(tag => {
                        //let name = tag.get('name', {decode: true, string: true});
                        //alert('middle - ' + cache[hash][0].tags[0].name);

                        //let value = tag.get('value', {decode: true, string: true});
                        //console.log(`${name} : ${value}`);
                        //return {name, value};
                        let name = tag.name;
                        try {
                            name = Base64.decode(name);
                        } catch (e) {
                        }
                        let value = tag.value;
                        try {
                            value = Base64.decode(value);
                        } catch (e) {
                        }

                        return {name, value};
                    });

                    return {...transaction, tags};
                }));

                console.log(result);
            }

            if (isDecodeText) {
                result = await Promise.all(result.map(transaction => {
                    let result = transaction.data;
                    try {
                        result = Base64.decode(transaction.data);
                    } catch (e) {
                    }

                    return result;
                }));
            }

            //alert('end - ' + cache[hash][0].tags[0].name);
        } else {
            result = response;
        }

        if (displayResponse !== result) {
            console.log('CHANGED');
            setDisplayResponse(result);
        } else {
            console.log('NOT CHANGED');

        }
    };

    return (
        <React.Fragment>
            <div className="container">
                <div className="row">
                    <div className="col-sm-6">
                        <h1>ArQL request</h1>

                        <div className="pre-window">
                            <button className="btn btn-success" onClick={onRunCode}>Run</button>
                        </div>

                        <JSONInput
                            id='a_unique_id'
                            placeholder={placeholder}
                            theme={'light_mitsuketa_tribute'}
                            locale={locale}
                            //height='550px'
                        />
                    </div>
                    <div className="col-sm-6">
                        <h1>Response</h1>
                        <div className="pre-window">
                            <div className="form-check form-check-inline">
                                <input id="checkbox-expanded" type="checkbox" className="form-check-input"
                                       checked={isExpanded}
                                       onChange={event => setExpanded(event.target.checked)}/>
                                <label className="form-check-label" htmlFor="checkbox-expanded">Expanded info</label>
                            </div>

                            <div className="form-check form-check-inline">
                                <input id="checkbox-tags" type="checkbox" className="form-check-input"
                                       checked={isDecodeTags}
                                       onChange={event => setDecodeTags(event.target.checked)}/>
                                <label className="form-check-label" htmlFor="checkbox-tags">Decode tags</label>
                            </div>

                            <div className="form-check form-check-inline">
                                <input id="checkbox-text" type="checkbox" className="form-check-input"
                                       checked={isDecodeText}
                                       onChange={event => setDecodeText(event.target.checked)}/>
                                <label className="form-check-label" htmlFor="checkbox-text">Decode text</label>
                            </div>
                        </div>
                        <JSONInput
                            id='a_unique_id_1'
                            placeholder={displayResponse}
                            theme={'light_mitsuketa_tribute'}
                            locale={locale}
                            viewOnly={true}
                            //height='550px'
                        />
                    </div>
                </div>
            </div>


        </React.Fragment>
    );
}

export default App;
