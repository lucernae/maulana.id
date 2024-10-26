import React from 'react'

export const PythonRunner = ({ pythonScriptSelector, plotScriptSelector }) => {
	const pythonScriptCodeBlock = document.querySelector(pythonScriptSelector)
	const pythonScriptContent = pythonScriptCodeBlock.textContent.trim()
	const plotScriptCodeBlock = document.querySelector(plotScriptSelector)
	const plotScriptContent = plotScriptCodeBlock.textContent.trim()
	const generatedID = React.useId()
	const spinnerID = `${generatedID}-spinner`
	const loadAndRunPythonScript = async () => {
		let pyodide = await loadPyodide()
		const spinner = document.getElementById(spinnerID)
		spinner.classList.remove('hidden')
		console.log('loading packages...')
		pyodide.loadPackage(['numpy', 'scipy']).then(() => {
			console.log('python execution started.')
			const pythonResult = pyodide.runPython(pythonScriptContent)
			window.pythonResult = pythonResult
			window.pyodideElementID = generatedID
			console.log('python execution finished.')
			setTimeout(plotScriptContent, 1)
		})
	}
	return (
		<div id={generatedID} className='p-6 border border-gray-200 rounded-lg'>
			<style>
				{`@keyframes spin {
					from {
					transform: rotate(0deg);
				}
					to {
					transform: rotate(360deg);
				}
				}
					.spinner {
					animation: spin 1s linear infinite;
				}
				`}
			</style>
			<div id={spinnerID} className='hidden flex justify-center items-center gap-6 w-full'>
				<div className='spinner rounded-full border-4 border-t-4 border-gray-200 border-t-blue-500 w-12 h-12 m-8'></div>
			</div>
			<button
				type='submit'
				className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
				onClick={loadAndRunPythonScript}
			>
				Run Python Script
			</button>
		</div>
	)
}
