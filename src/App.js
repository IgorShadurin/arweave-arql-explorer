import React, {useState} from 'react';
import './App.css';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';
import arweave from './ArweaveSetup';

function App() {
    const [response, setResponse] = useState({});
    const [displayResponse, setDisplayResponse] = useState({});
    const [isExpanded, setExpanded] = useState(true);
    const [isDecodeTags, setDecodeTags] = useState(true);
    const [isDecodeText, setDecodeText] = useState(true);
    const placeholder = {
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
    };

    const onRunCode = async () => {
        let result = await arweave.arql(placeholder);
        setResponse(result);
        console.log(result);
        if (isExpanded) {
            result = await Promise.all(result.map(txid => arweave.transactions.get(txid)));
            if (isDecodeTags) {
                await Promise.all(result.map(transaction => {
                    transaction['tags'] = transaction.get('tags').map(tag => {
                        let name = tag.get('name', {decode: true, string: true});
                        let value = tag.get('value', {decode: true, string: true});
                        //console.log(`${name} : ${value}`);
                        return {name, value};
                    });

                    return transaction;
                }));
            }

            if (isDecodeText) {
                result = await Promise.all(result.map(transaction => {
                    transaction['data'] = transaction.get('data', {decode: true, string: true});
                    return transaction;
                }));
            }
        }

        setDisplayResponse(result);
    };

    return (
        <React.Fragment>
            <div className="container">
                <div className="row">
                    <div className="col-sm-6">
                        <h1>ArQL request</h1>

                        <button className="btn btn-success" onClick={onRunCode}>Run</button>
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
