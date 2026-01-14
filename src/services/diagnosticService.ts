// @format

import * as vscode from 'vscode';
import { DiagnosticStatus } from '../models/tab';

const LOG_PREFIX = '[SideTabs.DiagnosticService]';

/**
 * Service to track diagnostic status of files
 */
export class DiagnosticService {
	private readonly _onDidChangeDiagnostics = new vscode.EventEmitter<
		Map<string, DiagnosticStatus>
	>();
	public readonly onDidChangeDiagnostics = this._onDidChangeDiagnostics.event;

	private diagnosticStatusMap: Map<string, DiagnosticStatus> = new Map();

	constructor() {
		try {
			// Listen for diagnostic changes
			vscode.languages.onDidChangeDiagnostics((event) => {
				this.handleDiagnosticChange(event);
			});

			// Initialize with current diagnostics
			this.initializeDiagnostics();
			console.log(`${LOG_PREFIX} Initialized with ${this.diagnosticStatusMap.size} files with diagnostics`);
		} catch (error) {
			console.error(`${LOG_PREFIX} Error during initialization:`, error);
		}
	}

	/**
	 * Initialize diagnostics for all open files
	 */
	private initializeDiagnostics(): void {
		try {
			const diagnostics = vscode.languages.getDiagnostics();

			for (const [uri, fileDiagnostics] of diagnostics) {
				const status = this.calculateDiagnosticStatus(fileDiagnostics);
				this.diagnosticStatusMap.set(uri.toString(), status);
			}
		} catch (error) {
			console.error(`${LOG_PREFIX} Error initializing diagnostics:`, error);
		}
	}

	/**
	 * Handle diagnostic change event
	 */
	private handleDiagnosticChange(event: vscode.DiagnosticChangeEvent): void {
		try {
			for (const uri of event.uris) {
				const diagnostics = vscode.languages.getDiagnostics(uri);
				const status = this.calculateDiagnosticStatus(diagnostics);
				const uriString = uri.toString();

				// Update status
				if (status === DiagnosticStatus.None) {
					this.diagnosticStatusMap.delete(uriString);
				} else {
					this.diagnosticStatusMap.set(uriString, status);
				}
			}

			// Notify listeners
			this._onDidChangeDiagnostics.fire(this.diagnosticStatusMap);
			console.log(`${LOG_PREFIX} Updated diagnostics for ${event.uris.length} files`);
		} catch (error) {
			console.error(`${LOG_PREFIX} Error handling diagnostic change:`, error);
		}
	}

	/**
	 * Calculate diagnostic status from diagnostics array
	 */
	private calculateDiagnosticStatus(
		diagnostics: vscode.Diagnostic[]
	): DiagnosticStatus {
		// Check for errors first (highest priority)
		const hasError = diagnostics.some(
			(d) => d.severity === vscode.DiagnosticSeverity.Error
		);
		if (hasError) {
			return DiagnosticStatus.Error;
		}

		// Check for warnings
		const hasWarning = diagnostics.some(
			(d) => d.severity === vscode.DiagnosticSeverity.Warning
		);
		if (hasWarning) {
			return DiagnosticStatus.Warning;
		}

		return DiagnosticStatus.None;
	}

	/**
	 * Get diagnostic status for a specific URI
	 */
	getDiagnosticStatus(uri: vscode.Uri): DiagnosticStatus {
		return (
			this.diagnosticStatusMap.get(uri.toString()) || DiagnosticStatus.None
		);
	}

	/**
	 * Get all diagnostic statuses
	 */
	getAllDiagnosticStatuses(): Map<string, DiagnosticStatus> {
		return new Map(this.diagnosticStatusMap);
	}

	/**
	 * Dispose of resources
	 */
	dispose(): void {
		this._onDidChangeDiagnostics.dispose();
		console.log(`${LOG_PREFIX} Disposed`);
	}
}
