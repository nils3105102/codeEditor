import 'bulmaswatch/superhero/bulmaswatch.min.css';
import * as esbuild from 'esbuild-wasm'; 
import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-terminal";
import prettier from 'prettier';
import parser from 'prettier/parser-babel';
import { fetchPlugin } from './plugins/fetch-plugin';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import './code-editor.css';

const App = () => {
    const [input, setInput] = useState('');
    const ref = useRef<any>();
    const aceRef = useRef<any>();
    const iframe = useRef<any>();

    const startService = async () => {
        ref.current = await esbuild.startService({
            worker: true,
            wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm'
        });
    }

    useEffect(() => {
        startService();
    }, []);

    const onClick = async () => {
        if (!ref.current) {
            return;
        }

        iframe.current.srcdoc = html;

        const result = await ref.current.build({
            entryPoints: ['index.js'],
            bundle: true,
            write: false,
            plugins: [
                unpkgPathPlugin(),
                fetchPlugin(input)
            ],
            define: {
                'process.env.NODE_ENV': '"production"',
                global: 'window'
            }
        });

        // setCode(result.outputFiles[0].text);
        iframe.current.contentWindow.postMessage(result.outputFiles[0].text, '*');
    }

    const html = `
        <html>
            <head></head>
            <body>
                <div id="root"></div>
                <script>
                    window.addEventListener('message', (event) => {
                        try {
                            eval(event.data);
                        } catch(err) {
                            const root = document.getElementById('root');
                            root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>'
                            console.error(err);
                        }
                    }, false);
                </script>
            </body>
        </html>
    `;

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
            <iframe ref={iframe} title="ide" sandbox="allow-scripts" srcDoc={html} />
        </div>
    );
}


ReactDOM.render(
    <App />,
    document.getElementById('root')
);