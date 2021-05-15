import { useRef, useState } from 'react';
import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-terminal";
import prettier from 'prettier';
import parser from 'prettier/parser-babel';
import './CodeCell.css';
import Preview from './Preview';
import { bundle } from '../bundler';

const CodeCell = () => {
    const [input, setInput] = useState('');
    const [code, setCode] = useState('');
    const aceRef = useRef<any>();

    const onClick = async () => {
        const output = await bundle(input);
        setCode(output);
    }

    const onFormatClick = () => {
        const unformatted = aceRef.current.editor.getValue();
        const formatted = prettier.format(unformatted, {
            parser: 'babel',
            plugins: [parser],
            useTabs: false,
            semi: true,
            singleQuote: true
        }).replace(/\n$/, '');
        
        aceRef.current.editor.setValue(formatted);
    };

    return (
        <div className="editor-wrapper">
            <button className="button button-format is-primary is-small" onClick={onFormatClick}>Format</button>
            <AceEditor
                ref={aceRef}
                onChange={(value) => setInput(value)}
                value={input}
                theme="terminal" 
                mode="javascript" 
                height="500px"
                width="100%"
                setOptions={{
                    wrap: true,
                    fontSize: 16,
                    indentedSoftWrap: false,
                    highlightActiveLine: false,
                    showPrintMargin: false
                }}
            />
            <textarea 
                value={input} 
                onChange={(e) => {
                    setInput(e.target.value)
                }}
            ></textarea>
            <div>
                <button onClick={onClick}>Sumbit</button>
            </div>
            <Preview code={code}/>
        </div>
    );
}

export default CodeCell;