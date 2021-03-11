import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function color(value) {
	switch(value) {
		case 1: return 'red'; break;
		case 2: return 'green'; break;
		case 3: return 'blue'; break;
		case 4: return 'yellow'; break;
	};
}

function recurScore(i) {
	if(i>0) return (i*5+recurScore(i-1));
	else return 0;
}

function Gem(props) {
	return (
		<button className={'square '+color(props.value)} onClick={props.onClick}>
			{props.value}
		</button>
	);
}

class Board extends React.Component {
	renderGem(i) {
		return (
			<Gem
				value={this.props.squares[i]}
				onClick={() => this.props.onClick(i)}
			/>
		);
	}

	render() {
		const board = [];
		
		//loop rendering gems in rows
		for(let i=0; i<this.props.rows; i++) {
			const squares = [];
			for(let j=0; j<this.props.cols; j++) 
				squares.push(<div key={i*this.props.cols+j}>
					{this.renderGem(i*this.props.cols+j)}
				</div>);
			board.push(<div className="board-row" key={i}>{squares}</div>);
		}
		
		return (
			<div>
				{board}
			</div>
		); 
	}
}


class Game extends React.Component {
	generateBoard(size) {
		let board = Array(size).fill(null);
		for(let i=0; i<size; i++) {
			board[i] = Math.floor((Math.random()*4)+1);		// generate values 1-4
		}
		return board;
	}
	
	constructor(props) {
		const rows = 8;
		const cols = 6; 
		
		super(props);
		this.state = {
			rows: rows,
			cols: cols,
			history: [
				{
					squares: this.generateBoard(rows*cols), 
					score: 0,
					gemsCollected: [0, 0, 0, 0, 0],
				}
			],
			stepNumber: 0,
			movesLeft: 100,
		};
	}
	
	removeConnected(squares, row, col, gemNo) {			// removes all connected gems of the same color
		//set yourself as 0
		const me = squares[gemNo];
		let gemNumber = 1;
		squares[gemNo] = 0;
		
		//check upper one
		//if it has the same number, removeConnected(it)
		if(row>0 && squares[gemNo-this.state.cols]==me) {
			gemNumber += this.removeConnected(squares, (row-1), col, (gemNo-this.state.cols));
		}
		
		//remove yourself, fall column
		for(let i=row; i>0; i--) {
			squares[i*this.state.cols+col] = squares[(i-1)*this.state.cols+col];		// fall gems
		}
		squares[col] = Math.floor((Math.random()*4)+1);		// new gem
		
		//check sides
		//if they have the same number, removeConnected(them)
		if(col>0 && squares[gemNo-1]==me) {
			gemNumber += this.removeConnected(squares, row, (col-1), (gemNo-1));
		}
		if(col<(this.state.cols-1) && squares[gemNo+1]==me) {
			gemNumber += this.removeConnected(squares, row, (col+1), (gemNo+1));
		}
		
		//check bottom one
		//if it has the same number, removeConnected(it)
		if(row<(this.state.rows-1) && squares[gemNo+this.state.cols]==me) {
			gemNumber += this.removeConnected(squares, (row+1), col, (gemNo+this.state.cols));
		}
		
		//return true
		return gemNumber;
	}
	
	handleClick(gemNo) {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();
		
		if(this.state.movesLeft <1) return;
		
		//remove gem, add score, fall gems
		const col = gemNo % this.state.cols;
		const row = Math.floor(gemNo/this.state.cols);
		
		const color = squares[gemNo];
		const gemsRemoved = this.removeConnected(squares, row, col, gemNo);
		
		const newGemsCollected = current.gemsCollected;
		newGemsCollected[0] += gemsRemoved;				// add total gems collected
		newGemsCollected[color] += gemsRemoved;			// add color gems collected
		
		const newScore = current.score+recurScore(gemsRemoved);
		
		//save move
		this.setState({
			history: history.concat([
				{
					squares: squares,
					score: newScore,
					gemsCollected: newGemsCollected,
				}
			]),
			stepNumber: history.length,
			movesLeft: this.state.movesLeft-1,
		});
	}

	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		
		const score = "Score: "+current.score;
		let movesLeft = this.state.movesLeft;
		if(movesLeft>0) {
			movesLeft = "Moves left: "+this.state.movesLeft;
		} else {
			movesLeft = "No more moves! The end.";
		}

		return (
			<div className="game">
				<div className="game-info">
					<div>{score}</div>
					<div className="moves-left">{movesLeft}</div>
					<div className="gems-collected">
						Gems collected:
						<table>
							<tr><td> Red: </td><td> {current.gemsCollected[1]} </td></tr>
							<tr><td> Green: </td><td> {current.gemsCollected[2]} </td></tr>
							<tr><td> Blue: </td><td> {current.gemsCollected[3]} </td></tr>
							<tr><td> Yellow: </td><td> {current.gemsCollected[4]} </td></tr>
							<tr className="line"><td colspan="2"><hr/></td></tr>
							<tr><td> Total: </td><td> {current.gemsCollected[0]} </td></tr>
						</table>
					</div>
				</div>
				<div className="game-board">
					<Board
						rows={this.state.rows}
						cols={this.state.cols}
						squares={current.squares}
						onClick={i => this.handleClick(i)}
					/>
				</div>
			</div>
		);
	}
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

