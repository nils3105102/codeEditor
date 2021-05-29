import { useEffect, useRef, useState } from 'react';
import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-terminal";
import prettier from 'prettier';
import parser from 'prettier/parser-babel';
import './CodeCell.css';
import Preview from './Preview';
import { bundle } from '../bundler';
import Resizable from './Resizable';

const CodeCell = () => {
    const [input, setInput] = useState('');
    const [code, setCode] = useState('');
    const aceRef = useRef<any>();

    useEffect(() => {
        const timer = setTimeout(async () => {
            const output = await bundle(input);
            setCode(output);
        }, 1000);

        return () => {
            clearTimeout(timer);
        }
    }, [input]);

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
        <Resizable direction="vertical">
            <div className="editor-wrapper">
                <button className="button button-format is-primary is-small" onClick={onFormatClick}>Format</button>
                <Resizable direction="horizontal">
                    <AceEditor
                        ref={aceRef}
                        onChange={(value) => setInput(value)}
                        value={input}
                        theme="terminal" 
                        mode="javascript" 
                        height="100%"
                        width="100%"
                        setOptions={{
                            wrap: true,
                            fontSize: 16,
                            indentedSoftWrap: false,
                            highlightActiveLine: false,
                            showPrintMargin: false
                        }}
                    />
                </Resizable>
                <Preview code={code}/>
            </div>
        </Resizable>
    );
}

export default CodeCell;