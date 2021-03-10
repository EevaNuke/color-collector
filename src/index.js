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
				}
			],
			stepNumber: 0,
			movesLeft: 10,
			score: 0,
		};
	}

	handleClick(gemNo) {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();
		
		if(this.state.movesLeft <1) return;
		
		//remove gem, add score, fall gems
		const col = gemNo % this.state.cols;
		const row = Math.floor(gemNo/this.state.cols);	
		
		for(let i=row; i>0; i--) {
			squares[i*this.state.cols+col] = squares[(i-1)*this.state.cols+col];
		}
		squares[col] = 0;
		
		const newScore = this.state.score+1;
		
		//save move
		this.setState({
			history: history.concat([
				{
					squares: squares,
				}
			]),
			stepNumber: history.length,
			movesLeft: this.state.movesLeft-1,
			score: newScore
		});
	}

	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		
		const score = "Score: "+this.state.score;
		let movesLeft = this.state.movesLeft;
		if(movesLeft>0) {
			movesLeft = "Moves: "+this.state.movesLeft;
		} else {
			movesLeft = "No more moves! The end.";
		}

		return (
			<div className="game">
				<div className="game-info">
					<div>{score}</div>
					<div>{movesLeft}</div>
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

function calculateWinner(squares) {
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6]
	];
	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
			return squares[a];
		}
	}
	return null;
}
