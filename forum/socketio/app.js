// nodeJS express
var express = require('express');
var app = express();
var path = require('path');

// nodeJS socket-io
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// child-process
const { spawn } = require('child_process');
// korean decoding library
const iconv = require('iconv-lite');

// MySQL Database Connection
var mysql = require('mysql2');
const { start } = require('repl');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '1234',
    database : 'eyetracking',
    dateStrings : 'date'
});
connection.connect()
app.use(express.urlencoded({extended: true}));

/////////////////////////////////////////////////////////////////////
// localhost:3000으로 접속하면 클라이언트에게 index.html 파일 전송(응답)
app.get('/', function(req, res) { 
    res.sendFile(__dirname + '/views/login.html');
});


app.use(express.static(path.join(__dirname, 'static')));
///////////////////////////////////////////////////////////////////////
app.use((req, res, next) => {
    res.header("Cross-Origin-Embedder-Policy", "credentialless");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    next();
});
///////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
var user_id = 1;
app.post('/login', function(req, res) {
    console.log("login function is excuting.");
    const user = {
        id: req.body.id,
        pw: req.body.password,
    };
    console.log(user.id, user.pw);
    connection.query('select * from user where username = ? and password = ?', 
                      [user.id, user.pw], 
                      (err, result) => {
                        if (err) throw error;
                        if (result.length > 0) {
                            console.log('Login Success!');
                            user_id = result[0]['id'];
                            return res.redirect('/main');
                        }
                        else {
                            console.log('Login Failed!');
                            return res.send(`<script>alert('Login Failed. If you have no account, please sign-up.');
                                            window.location.href='/';</script>`);
                        }
    })
});
///////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
// 회원가입 화면에서 정보를 받아옴
app.post('/register', function(req, res) {
    console.log('register function is excuting.');
    // login.html의 sign up section에서 입력된 값 받아오기.
    const user = {
        id: req.body.id,
        pw: req.body.password,
        name: req.body.name,
        email: req.body.email,
    };

    console.log(user);
    // 입력된 정보를 Database에 저장.
    connection.query('insert into user (id, password, name, email) values (?, ?, ?, ?)', 
                    [user.id, user.pw, user.name, user.email], 
                    (err, result) => {
                        if (err) throw err;
                        else {
                            // 정상적으로 회원가입이 완료되면 login(기본) 페이지로 돌아감.
                            console.log('user info is registered.');
                            res.redirect('/'); 
                        }
    })
})
///////////////////////////////////////////////////////////////////////

// 읽기 페이지
app.get('/read', function(req, res) { 
    res.sendFile(__dirname + '/views/read.html');
})

// 메인 페이지
app.get('/main', function(req, res) { 
    res.sendFile(__dirname + '/views/main.html');
})

// 독해 분석 페이지
app.get('/analysis', function(req, res) {
    res.sendFile(__dirname + '/views/analysis.html')
})

// 학습한 단어 확인 페이지
app.get('/history', function(req, res) {
    res.sendFile(__dirname + '/views/history.html')
})

// 학습한 단어 상세 확인 페이지
app.get('/details', function(req, res) {
    res.sendFile(__dirname + '/views/details.html')
})


// 단어 검색 함수
function searchMeaning(searchWord, callback) {
    // 소문자로 검색 (이전에 영어인지 확인 필요함.)
    // const word = searchWord.toLowerCase();
    // 검색 쿼리
    // const query = 'SELECT * FROM vocabulary WHERE word = ?';
    console.log(searchWord);

    connection.query('SELECT * FROM dictionary WHERE word = ?', 
                     [searchWord],
                     (error, result) => {
                        if (error) {
                            callback(error, null);
                            return true;
                        }
                        console.log(result);
                        if (result.length > 0) {
                            connection.query('INSERT INTO study VALUES(null, ?, ?, now())',
                                            [user_id, result[0].id],
                                            (err, result) => {
                                                if (err) throw err;
                                            })
                            callback(null, result[0]);
                        } else {
                            callback(null, null);
                        }
    });
}

var startTime = '', wordCount = 0;

// db에 reading 기록 저장
function saveHistoryDB() {
    connection.query('INSERT INTO history VALUES(null, ?, ?, ?, now());',
                    [user_id, startTime, wordCount], 
                    (err, result) => {
                        if (err) throw err;
});
}

// db에서 글자 수와 시간을 통해 초당 단어를 몇개나 읽는지 계산하여 리스트에 담은 후 반환
function analysisInfo(callback) {
    var data = [];
    connection.query('SELECT word_count, TIMESTAMPDIFF(SECOND, created_at, reading_time) hour, reading_time FROM history WHERE user_id = ?;', 
                     [user_id],
                     (err, result) => {
                        if (err) return callback(err, null);
                        if (result.length >= 0) {
                            for (var i = 0; i < result.length; i++) {
                                var date = result[i]['reading_time'];
                                var time = result[i]['word_count'] / result[i]['hour'] * 60 * 60;
                                data.push({ category: date, value: time });
                            }
                            callback(null, data);
                        }
    });
}

io.on('connection', function(socket){
    socket.on('findMeaning', (coordinates) => {
        const { x, y } = coordinates
        const capResult = spawn('python', ['./static/py-capture.py', x.toString(), y.toString()]);
        capResult.stdout.on('data', function(capData) {
            console.log(capData.toString());
        });
        capResult.on('close', (code) => {
            console.log(`프로세스 종료, 코드: ${code}`);
        });

        // setTimeout(function() {
        const ocrResult = spawn('python', ['./static/gpt-ocr.py']);
        ocrResult.stdout.on('data', function(ocrData) {
            var word = iconv.decode(ocrData, 'euc-kr');
            word = word.replace(/[^가-힣a-zA-Z]/g, '');
            
            console.log("찾고자 하는 단어", word);
            console.log("길이", word.length);
            searchMeaning(word, (error, ret) => {
                if (error) {
                    console.log('에러 발생: ', error);
                    return;
                }
                
                if (ret) {
                    console.log(word, ":", ret.meaning);
                    // document.getElementById("mean").value += `${word} : ${meaning} / 품사: ${word_class}\n`
                    const data = {
                        word: word,
                        meaning: ret.meaning,
                        class: ret.class
                    };
                    socket.emit('wordInfo', data);
                } else {
                    console.log(word, "의 뜻을 찾을 수 없습니다.");
                }
            })
        });
        console.log("finishing to find word meaning");
        // }, 500);
    });
    
    
    socket.on('forceDisconnect', function() {
        socket.disconnect();
    });
    
    socket.on('disconnect', function() {
        console.log('user disconnected: ' + socket.name);
    });

    socket.on('recordReading', (textLength) => {
        const textWordCount = textLength;
        wordCount = textWordCount;
        connection.query('SELECT now();', [], (error, result) => {
            if (error) {
                callback(error, null);
                return true;
            }
            console.log(result);
            // Extract the date string from the result
            startTime = result[0]['now()'];
            console.log(`Datetime=${startTime}`);
        });        
    });
    
    socket.on('stopRecordReading', () => {
        saveHistoryDB();
    });

    socket.on('analysisDataReq', () => {
        analysisInfo((err, data) => {
            const analysisData = data;
            // console.log("data=", data);
            // console.log("analysisData=", analysisData);
            connection.query('SELECT username FROM user WHERE id = ?;', [user_id], (error, result) => {
                if (error) {
                    callback(error, null);
                    return true;
                }
                // console.log(result);
                // Extract the date string from the result
                const username = result[0]['username'];
                if(data.length>0) {
                    console.log(data);
                    socket.emit('analysisDataRes', [analysisData, username]);
                } else {
                    // console.log("데이터가 없음");
                    socket.emit('analysisNoDataRes', username);
                }

            });        
        });
 
    });

    socket.on('getHistoryData', (data) => {
        // Query to fetch history data
        const query = `
            SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS studied_date, COUNT(*) AS word_count
            FROM study
            WHERE user_id = ?
            GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
            ORDER BY studied_date ASC
        `;
        
        // Execute the query
        connection.query(query, [user_id], (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                return;
            }
            // console.log('History data fetched:', results);
            // Emit history data to the client
            socket.emit('historyData', {results, user_id});
        });
    });
    
    socket.on('getWordHistory', async (data) => {
        const detailsQuery = `SELECT d.word, d.meaning, d.class
                              FROM study s
                              JOIN dictionary d ON s.dictionary_id = d.id
                              WHERE s.user_id = ? AND DATE(s.created_at) = ?;
                             `
        
        connection.query(detailsQuery, [data.userId, data.date], (err, result) => {
            if (err) {
                console.log('Error executing query: ', err);
                return;
            }
            // console.log('Details data fetched:', result);
            socket.emit('wordHistoryResponse', result);
        })
    });

});

server.listen(3000, function() {
    console.log('Socket IO server listening on port 3000');
});