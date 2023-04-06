module.exports = {
    apps: [{
        name: "scib2g", // 이름. 나중에 이 이름으로 프로세스를 관리한다
        script: "./app.js", // 실행할 파일 경로
        instance_var: "INSTANCE_ID",
        instances: 4, // 클러스터 모드 사용 시 생성할 인스턴스 수
        exec_mode: "cluster", // fork, cluster 모드 중 선택
        merge_logs: true, // 클러스터 모드 사용 시 각 클러스터에서 생성되는 로그를 한 파일로 합쳐준다.
        autorestart: true, // 프로세스 실패 시 자동으로 재시작할지 선택
        watch: false, // 파일이 변경되었을 때 재시작 할지 선택
        max_memory_restart: "512M", // 프로그램의 메모리 크기가 일정 크기 이상이 되면 재시작한다.
        out_file: "/home/hybrid/sci_b2g/log/scib2g-out.log",
        error_file: "/home/hybrid/sci_b2g/log/scib2g-err.log",
        cron_restart: '0 6 * * *',

        env: {
            // 개발 환경설정
            PORT: 7070,
            NODE_ENV: "development"
        },
        env_production: {
            // 운영 환경설정 (--env production 옵션으로 지정할 수 있다.)
            PORT: 7070,
            NODE_ENV: "production"
        },
    }],

    deploy: {
        development: {
            // 개발 환경설정
            user: "root",
            host: [{ host: "211.62.105.193" }],
            // 프로젝트 배포 후 실행할 명령어
            "post-deploy": "npm install && pm2 reload ecosystem.config.js --env development"
        },
        production: {
            // 운영 환경설정
            user: "root",
            host: [{ host: "211.62.105.193" }],
            ref: "origin/master",
            repo: "/home/hybrid/sci_b2g/server",
            path: "/home/sci_b2g",
            "post-deploy": "npm install && pm2 reload ecosystem.config.js --env production"

            //...
        }
    }
};