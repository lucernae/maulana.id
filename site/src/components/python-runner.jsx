import React from 'react'

export const PythonRunner = ({ pythonScriptSelector, plotScriptSelector }) => {
	const pythonScriptCodeBlock = document.querySelector(pythonScriptSelector)
	const pythonScriptContent = pythonScriptCodeBlock.textContent.trim()
	const plotScriptCodeBlock = document.querySelector(plotScriptSelector)
	const plotScriptContent = plotScriptCodeBlock.textContent.trim()
	const generatedID = React.useId()
	const spinnerID = `${generatedID}-spinner`
	const loadAndRunPythonScript = async (e) => {
		// Disable the button
		e.target.disabled = true
		// Optionally, you can also add a visual indication that the button is disabled
		e.target.classList.add('opacity-50', 'cursor-not-allowed')

		const spinner = document.getElementById(spinnerID)
		spinner.classList.remove('hidden')
		console.log('loading packages...')

		try {
			let pyodide = await loadPyodide()
			pyodide.loadPackage(['numpy', 'scipy']).then(() => {
				console.log('python execution started.')
				const pythonResult = pyodide.runPython(pythonScriptContent)
				window.pythonResult = pythonResult
				window.pyodideElementID = generatedID
				console.log('python execution finished.')
				// Re-enable the button in case of error
				e.target.disabled = false
				e.target.classList.remove('opacity-50', 'cursor-not-allowed')
				setTimeout(plotScriptContent, 1)
			})
		} catch (error) {
			console.error('Error running Python script:', error)
			// Re-enable the button in case of error
			e.target.disabled = false
			e.target.classList.remove('opacity-50', 'cursor-not-allowed')
		}
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
