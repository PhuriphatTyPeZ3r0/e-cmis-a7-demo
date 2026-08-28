    // Global LocalStorage state variables
    const SEED_CASES_101 = [
        { id: 'ปปท. 115/2569', type: 'ไม่ฟ้อง', accuser: 'ป.ป.ท.', accused: 'นายสมชาย วงศ์ดี', blackId: 'อท 112/68', redId: '—', office: 'สนง.อัยการปราบฯ ภาค 1', court: 'ศาลอาญาคดีทุจริตฯ ภาค 1', responsible: 'นายปิติคุณ อู่ตะเภา', status: 'รอคำวินิจฉัยอัยการ', dueDate: '2026-07-15', step: 3, timeline: [
            { date: '12 พ.ค. 2569', desc: 'รับสำนวนจากพนักงานอัยการ · ออกเลขอัตโนมัติ' }
        ], docs: [
            { name: 'คำฟ้องโจทก์.pdf', size: '2.4 MB', uploader: 'อัยการ', date: '12 พ.ค. 69' },
            { name: 'ความเห็นพนักงานอัยการ.docx', size: '318 KB', uploader: 'ธุรการ กองกฎหมาย', date: '12 พ.ค. 69' }
        ] },
        { id: 'ปปท. 108/2569', type: 'ถอนฟ้อง', accuser: 'ป.ป.ท.', accused: 'นางวิภา ชัยชนะ', blackId: 'อท 98/68', redId: 'อ 45/69', office: 'ศาลอาญาคดีทุจริตฯ กลาง', court: 'ศาลอาญาคดีทุจริตฯ กลาง', responsible: 'นายอานนท์ ชนประชา', status: 'อยู่ระหว่างศาลชั้นต้น', dueDate: '2026-09-30', step: 4, timeline: [
            { date: '12 พ.ค. 2569', desc: 'รับสำนวนจากพนักงานอัยการ · ออกเลขอัตโนมัติ' },
            { date: '13 พ.ค. 2569', desc: 'มอบหมาย นายอานนท์ ชนประชา + Push Notification' },
            { date: '18 พ.ค. 2569', desc: 'นิติกรจัดทำความเห็นเสนอผู้บังคับบัญชา' },
            { date: '24 พ.ค. 2569', desc: 'ผอ.กองกฎหมาย ลงนามดิจิทัลความเห็น (e-Approval)' },
            { date: '2 มิ.ย. 2569', desc: 'บอร์ด ป.ป.ท. มีมติเห็นแย้ง → ส่ง อสส. ชี้ขาด' }
        ], docs: [
            { name: 'คำฟ้องโจทก์.pdf', size: '2.4 MB', uploader: 'อัยการ', date: '12 พ.ค. 69' },
            { name: 'ความเห็นพนักงานอัยการ.docx', size: '318 KB', uploader: 'ธุรการ กองกฎหมาย', date: '12 พ.ค. 69' },
            { name: 'ความเห็นนิติกร (ลงนามครบ).pdf', size: '1.1 MB', uploader: 'e-Approval', date: '24 พ.ค. 69' },
            { name: 'มติบอร์ด ครั้งที่ 12-2569.pdf', size: '640 KB', uploader: 'ฝ่ายเลขาฯ', date: '2 มิ.ย. 69' }
        ], signatures: [
            { name: 'นายอานนท์ ชนประชา', role: 'นิติกรชำนาญการ · ผู้จัดทำ', status: 'signed', date: '18 พ.ค. 14:30', hash: '8f9c2d1b7a4c9e8d...e7a4' },
            { name: 'นางสาว อรวรรณ ทูลมณี', role: 'ผอ.กลุ่มงานคดี', status: 'signed', date: '19 พ.ค. 09:12', hash: '3e4f1a2b5d6c7e8f...d6c7' },
            { name: 'นายชยุต ภควัตทิพากร', role: 'ผอ.กองกฎหมาย', status: 'pending', date: 'ครบกำหนดวันนี้', hash: '' },
            { name: 'เลขาธิการ ป.ป.ท.', role: 'เสนอเข้าวาระบอร์ด ป.ป.ท.', status: 'pending', date: 'ยังไม่ถึงลำดับ', hash: '' }
        ] },
        { id: 'ปปท. 093/2568', type: 'ไม่อุทธรณ์', accuser: 'ป.ป.ท.', accused: 'นายอานนท์ ทวีสุข', blackId: 'อท 77/68', redId: 'อ 31/68', office: 'ศาลอาญาคดีทุจริตฯ ภาค 4', court: 'ศาลอาญาคดีทุจริตฯ ภาค 4', responsible: 'นายปิติคุณ อู่ตะเภา', status: 'รอมติบอร์ด ป.ป.ท.', dueDate: '2026-07-19', step: 5, timeline: [
            { date: '18 ต.ค. 2568', desc: 'ลงทะเบียนมอบหมายสำนวน' }
        ], docs: [] },
        { id: 'ปปท. 087/2568', type: 'ไม่ฎีกา', accuser: 'ป.ป.ท.', accused: 'นายประเสริฐ พ.', blackId: 'อท 61/67', redId: 'อ 22/68', office: 'สนง.อัยการสูงสุด', court: 'สนง.อัยการสูงสุด', responsible: 'นางสาว อรวรรณ ทูลมณี', status: 'ใกล้ครบอายุความ', dueDate: '2026-07-22', step: 6, timeline: [
            { date: '12 ก.ย. 2568', desc: 'ลงทะเบียนมอบหมายสำนวน' }
        ], docs: [] },
        { id: 'ปปท. 076/2568', type: 'ไม่ฟ้อง', accuser: 'ป.ป.ท.', accused: 'น.ส.กมลรัตน์ อ.', blackId: 'อท 55/67', redId: 'อ 18/68', office: 'ศาลอุทธรณ์ แผนกทุจริตฯ', court: 'ศาลอุทธรณ์ แผนกทุจริตฯ', responsible: 'นายอานนท์ ชนประชา', status: 'อยู่ระหว่างศาลอุทธรณ์', dueDate: '2026-12-12', step: 5, timeline: [
            { date: '10 ส.ค. 2568', desc: 'ลงทะเบียนมอบหมายสำนวน' }
        ], docs: [] },
        { id: 'ปปท. 064/2567', type: 'ไม่ฟ้อง', accuser: 'ป.ป.ท.', accused: 'นายวสันต์ คำแก้ว', blackId: 'อท 41/67', redId: 'อ 09/67', office: 'ศาลอาญาคดีทุจริตฯ ภาค 6', court: 'ศาลอาญาคดีทุจริตฯ ภาค 6', responsible: 'นางสาวนิติพร มีไพฑูรย์', status: 'คดีถึงที่สุด', dueDate: '2025-12-31', step: 7, timeline: [], docs: [] },
        { id: 'ปปท. 059/2567', type: 'ถอนฟ้อง', accuser: 'ป.ป.ท.', accused: 'นางสุนีย์ บุญมาก', blackId: 'อท 38/67', redId: 'อ 05/67', office: 'สนง.อัยการปราบฯ ภาค 9', court: 'ศาลอาญาคดีทุจริตฯ ภาค 9', responsible: 'นางสาว อรวรรณ ทูลมณี', status: 'คดีถึงที่สุด', dueDate: '2025-11-30', step: 7, timeline: [], docs: [] }
    ];

    const SEED_APPEALS_102 = [
        { id: 'อธ. 013/2569', type: 'คำอุทธรณ์', name: 'สมาคมผู้สื่อข่าวฯ', sourceNo: 'สขร. 025/69', receivedDate: '2026-06-15', dueDate: '2026-07-14', sgOpinion: 'ยืนตามคำสั่งเดิม', boardDecision: '—', docsCount: 5, status: 'รอบอร์ดพิจารณา', isPublic: false },
        { id: 'อธ. 014/2569', type: 'คำอุทธรณ์', name: 'นายพงศกร มีทรัพย์', sourceNo: 'สขร. 029/69', receivedDate: '2026-06-22', dueDate: '2026-07-22', sgOpinion: '—', boardDecision: '—', docsCount: 3, status: 'รอเสนอเลขาธิการ', isPublic: false },
        { id: 'อธ. 012/2569', type: 'คำอุทธรณ์', name: 'นายเกรียงไกร ส.', sourceNo: 'สขร. 021/69', receivedDate: '2026-06-02', dueDate: '2026-07-01', sgOpinion: 'ยืนตามคำสั่งเดิม', boardDecision: '—', docsCount: 2, status: 'เกินกำหนดพิจารณา', isPublic: false },
        { id: 'อธ. 011/2569', type: 'คำอุทธรณ์', name: 'น.ส.ปาริชาติ ทอง', sourceNo: 'สขร. 018/69', receivedDate: '2026-05-25', dueDate: '2026-06-23', subCommittee: 'เห็นควรให้เปิดเผย', sgOpinion: 'ให้เปิดเผย', boardDecision: 'เห็นชอบ', docsCount: 6, status: 'แจ้งผลอุทธรณ์แล้ว', isPublic: true },
        { id: 'อธ. 010/2569', type: 'คำอุทธรณ์', name: 'นายจิรศักดิ์ วัฒนา', sourceNo: 'สขร. 015/69', receivedDate: '2026-05-12', dueDate: '2026-06-10', sgOpinion: 'เปิดเผยบางส่วน', boardDecision: 'เห็นชอบ', docsCount: 4, status: 'แจ้งผลอุทธรณ์แล้ว', isPublic: true },
        { id: 'อธ. 009/2569', type: 'คำอุทธรณ์', name: 'มูลนิธิต้านทุจริต', sourceNo: 'สขร. 011/69', receivedDate: '2026-04-30', dueDate: '2026-05-29', sgOpinion: 'ยืนตามคำสั่งเดิม', boardDecision: 'ยืนตามคำสั่ง', docsCount: 7, status: 'แจ้งผลอุทธรณ์แล้ว', isPublic: false }
    ];

    const SEED_REQUESTS_102 = [
        { id: 'สขร. 038/2569', type: 'คำร้องขอข้อมูล', name: 'นายสมจิตต์ รักชาติ', division: 'กองไต่สวน 1', receivedDate: '2026-06-18', dueDate: '2026-07-18', decision: '—', status: 'รอเสนอ', docsCount: 2 },
        { id: 'สขร. 037/2569', type: 'คำร้องขอข้อมูล', name: 'นายวิรัช อุดมสิน', division: 'ปปท. เขต 7', receivedDate: '2026-06-02', dueDate: '2026-07-17', subCommittee: 'เห็นควรให้เปิดเผยได้', decision: 'เปิดเผย', status: 'แจ้งผลแล้ว', docsCount: 4 },
        { id: 'สขร. 035/2569', type: 'คำร้องขอข้อมูล', name: 'มูลนิธิต้านทุจริต', division: 'สำนักเลขาธิการ', receivedDate: '2026-05-28', dueDate: '2026-06-01', decision: '—', status: 'เกินกำหนดพิจารณา', docsCount: 1 },
        { id: 'สขร. 033/2569', type: 'คำร้องขอข้อมูล', name: 'นางรัตนา คงคา', division: 'กองปราบปรามฯ เขต 1', receivedDate: '2026-05-20', dueDate: '2026-07-04', decision: 'ไม่เปิดเผย', status: 'แจ้งผลแล้ว', docsCount: 3 }
    ];

    /*
     * คดีปกครอง — 1 สำนวนผูกกับคดีศาลได้หลายใบ (การแตกสำนวน / การอุทธรณ์)
     *
     * `id` เป็นคีย์สังเคราะห์ ไม่ใช่เลขคดีดำ เพราะคดีได้เลขดำใหม่ทุกชั้นศาล
     * `redNo === null` แปลว่าศาลชั้นนั้นยังพิจารณาอยู่ — ไม่ต้องมีฟิลด์สถานะแยก
     * `history[]` คือแหล่งเดียวของสถิติระยะเวลาตาม TOR 10.3.5
     */
    const SEED_ADMIN_CASES_103 = [
        {
            id: 'AC-2569-044', workStatus: 'เสนอบอร์ดมอบอำนาจ',
            plaintiff: 'นายก้องภพ ฯ', defendant: 'สำนักงาน ป.ป.ท. และคณะกรรมการ ป.ป.ท.', interpleader: '',
            sourceCase: 'ปปท.87/67', reason: 'ขอเพิกถอนคำสั่งทางปกครองของคณะกรรมการ ป.ป.ท.',
            responsible: 'นางสาว อรวรรณ ทูลมณี', receivedDate: '2026-01-08',
            nextDate: '2026-07-06', nextDateNote: '', year: 2569,
            courtCases: [
                { level: 'ชั้นต้น', court: 'ศาลปกครองกลาง', blackNo: 'บ 44/2569', blackDate: '2026-01-08', redNo: null, redDate: null, result: null }
            ],
            history: [
                { ts: '2026-01-08', event: 'received', desc: 'รับหมายเรียกศาลปกครองกลาง' },
                { ts: '2026-01-16', event: 'assigned', desc: 'มอบหมาย นางสาว อรวรรณ ทูลมณี' },
                { ts: '2026-02-02', event: 'board_authorise', desc: 'เสนอบอร์ด ป.ป.ท. เพื่อมอบอำนาจแก้ต่างคดี' }
            ],
            docs: [{ name: 'หมายเรียกศาลปกครองกลาง.pdf', size: '1.2 MB', uploader: 'ธุรการ กองกฎหมาย', date: '2026-01-08' }]
        },
        {
            id: 'AC-2569-041', workStatus: 'อยู่ระหว่างกลุ่มงานคดี',
            plaintiff: 'นางมาลี ฯ', defendant: 'สำนักงาน ป.ป.ท. และคณะกรรมการ ป.ป.ท.', interpleader: 'ผู้ร้องสอด 1',
            sourceCase: 'ปปท.72/67', reason: 'ขอให้เพิกถอนมติชี้มูลความผิดวินัยไม่ร้ายแรง',
            responsible: 'นายอานนท์ ชนประชา', receivedDate: '2026-02-02',
            nextDate: '2026-07-21', nextDateNote: '', year: 2569,
            courtCases: [
                { level: 'ชั้นต้น', court: 'ศาลปกครองนครราชสีมา', blackNo: 'บ 41/2569', blackDate: '2026-02-02', redNo: null, redDate: null, result: null }
            ],
            history: [
                { ts: '2026-02-02', event: 'received', desc: 'รับหมายเรียกศาลปกครองนครราชสีมา' },
                { ts: '2026-02-09', event: 'assigned', desc: 'มอบหมาย นายอานนท์ ชนประชา' },
                { ts: '2026-02-27', event: 'in_progress', desc: 'กลุ่มงานคดีจัดทำคำให้การแก้ต่าง' }
            ],
            docs: []
        },
        {
            id: 'AC-2569-038', workStatus: 'ส่งสำนวนให้อัยการ',
            plaintiff: 'นายสมหมาย ฯ', defendant: 'สำนักงาน ป.ป.ท.', interpleader: '',
            sourceCase: 'ปปท.66/66', reason: 'ขอเพิกถอนคำสั่งไม่รับคำร้องเรียน',
            responsible: 'นางสาวนิติพร มีไพฑูรย์', receivedDate: '2026-02-20',
            nextDate: null, nextDateNote: 'รอนัดแรก', year: 2569,
            courtCases: [
                { level: 'ชั้นต้น', court: 'ศาลปกครองกลาง', blackNo: 'บ 38/2569', blackDate: '2026-02-20', redNo: null, redDate: null, result: null }
            ],
            history: [
                { ts: '2026-02-20', event: 'received', desc: 'รับหมายเรียกศาลปกครองกลาง' },
                { ts: '2026-02-24', event: 'assigned', desc: 'มอบหมาย นางสาวนิติพร มีไพฑูรย์' },
                { ts: '2026-03-10', event: 'in_progress', desc: 'กลุ่มงานคดีจัดทำคำให้การแก้ต่าง' },
                { ts: '2026-04-01', event: 'sent_prosecutor', desc: 'ส่งสำนวนให้พนักงานอัยการแก้ต่างคดี' }
            ],
            docs: [{ name: 'หนังสือส่งสำนวนให้อัยการ.pdf', size: '540 KB', uploader: 'กองกฎหมาย', date: '2026-04-01' }]
        },
        {
            id: 'AC-2568-012', workStatus: 'คดีถึงที่สุด',
            plaintiff: 'สำนักงาน ป.ป.ท. (ผู้ฟ้องคดี)', defendant: 'นายชูชาติ ฯ', interpleader: '',
            sourceCase: 'ปปท.51/66', reason: 'อุทธรณ์คำพิพากษาศาลปกครองชั้นต้นที่ให้เพิกถอนมติ',
            responsible: 'นางสาว อรวรรณ ทูลมณี', receivedDate: '2025-02-20',
            nextDate: null, nextDateNote: '—', year: 2568,
            courtCases: [
                { level: 'สูงสุด', court: 'ศาลปกครองสูงสุด', blackNo: 'อ 12/2568', blackDate: '2025-03-04', redNo: 'อ 03/69', redDate: '2026-02-11', result: 'ชนะคดี' }
            ],
            history: [
                { ts: '2025-02-20', event: 'received', desc: 'รับสำเนาอุทธรณ์จากศาลปกครองสูงสุด' },
                { ts: '2025-02-26', event: 'assigned', desc: 'มอบหมาย นางสาว อรวรรณ ทูลมณี' },
                { ts: '2025-03-12', event: 'in_progress', desc: 'กลุ่มงานคดีจัดทำคำแก้อุทธรณ์' },
                { ts: '2026-02-11', event: 'result', desc: 'ศาลปกครองสูงสุดพิพากษา — ออกเลขคดีแดง อ 03/69 (ชนะคดี)' },
                { ts: '2026-02-20', event: 'final', desc: 'คดีถึงที่สุด' }
            ],
            docs: [{ name: 'คำพิพากษาศาลปกครองสูงสุด.pdf', size: '3.1 MB', uploader: 'นิติกร', date: '2026-02-11' }]
        },
        {
            id: 'AC-2568-029', workStatus: 'อยู่ระหว่างกลุ่มงานคดี',
            plaintiff: 'นายบุญส่ง ฯ', defendant: 'สำนักงาน ป.ป.ท. และคณะกรรมการ ป.ป.ท.', interpleader: '',
            sourceCase: 'ปปท.43/65', reason: 'ขอเพิกถอนมติคณะกรรมการ ป.ป.ท. ที่ชี้มูลความผิดวินัยร้ายแรง',
            responsible: 'นายปิติคุณ อู่ตะเภา', receivedDate: '2025-01-08',
            nextDate: '2026-07-27', nextDateNote: 'แถลงปิดคดี', year: 2568,
            courtCases: [
                { level: 'ชั้นต้น', court: 'ศาลปกครองเชียงใหม่', blackNo: 'บ 29/2568', blackDate: '2025-01-08', redNo: 'บ 88/68', redDate: '2026-03-14', result: 'ชนะคดี' },
                { level: 'สูงสุด', court: 'ศาลปกครองสูงสุด', blackNo: 'อ 12/2569', blackDate: '2026-05-02', redNo: null, redDate: null, result: null }
            ],
            history: [
                { ts: '2025-01-08', event: 'received', desc: 'รับหมายเรียกศาลปกครองเชียงใหม่' },
                { ts: '2025-01-12', event: 'assigned', desc: 'มอบหมาย นายปิติคุณ อู่ตะเภา' },
                { ts: '2025-01-25', event: 'in_progress', desc: 'บอร์ด ป.ป.ท. มีมติมอบอำนาจแก้ต่างคดี' },
                { ts: '2026-03-14', event: 'result', desc: 'ศาลชั้นต้นพิพากษา — ออกเลขคดีแดง บ 88/68 (ชนะคดี)' },
                { ts: '2026-05-02', event: 'appeal', desc: 'ผู้ฟ้องยื่นอุทธรณ์ — ศาลปกครองสูงสุดออกเลขคดีดำ อ 12/2569' }
            ],
            docs: [
                { name: 'หมายเรียกศาลปกครองเชียงใหม่.pdf', size: '1.2 MB', uploader: 'ธุรการ กองกฎหมาย', date: '2025-01-08' },
                { name: 'หนังสือมอบอำนาจ (มติบอร์ด ครั้งที่ 2-2568).docx', size: '318 KB', uploader: 'ฝ่ายเลขาฯ', date: '2025-01-25' },
                { name: 'คำพิพากษาศาลปกครองชั้นต้น (คดีแดง บ 88/68).pdf', size: '2.4 MB', uploader: 'นิติกร', date: '2026-03-14' }
            ]
        },
        {
            id: 'AC-2568-022', workStatus: 'ส่งสำนวนให้อัยการ',
            plaintiff: 'น.ส.เพ็ญศรี ฯ', defendant: 'สำนักงาน ป.ป.ท.', interpleader: '',
            sourceCase: 'ปปท.38/65', reason: 'ขอเพิกถอนคำสั่งลงโทษทางวินัย',
            responsible: 'นายอานนท์ ชนประชา', receivedDate: '2025-04-02',
            nextDate: '2026-07-09', nextDateNote: 'ครบกำหนดยื่นอุทธรณ์', year: 2568,
            courtCases: [
                { level: 'ชั้นต้น', court: 'ศาลปกครองกลาง', blackNo: 'บ 22/2568', blackDate: '2025-04-02', redNo: 'บ 71/68', redDate: '2026-04-18', result: 'แพ้คดี' }
            ],
            history: [
                { ts: '2025-04-02', event: 'received', desc: 'รับหมายเรียกศาลปกครองกลาง' },
                { ts: '2025-04-10', event: 'assigned', desc: 'มอบหมาย นายอานนท์ ชนประชา' },
                { ts: '2025-04-28', event: 'in_progress', desc: 'กลุ่มงานคดีจัดทำคำให้การแก้ต่าง' },
                { ts: '2026-04-18', event: 'result', desc: 'ศาลชั้นต้นพิพากษา — ออกเลขคดีแดง บ 71/68 (แพ้คดี)' },
                { ts: '2026-05-06', event: 'sent_prosecutor', desc: 'ส่งสำนวนให้อัยการพิจารณายื่นอุทธรณ์' }
            ],
            docs: [{ name: 'คำพิพากษาศาลปกครองชั้นต้น (คดีแดง บ 71/68).pdf', size: '2.0 MB', uploader: 'นิติกร', date: '2026-04-18' }]
        },
        {
            id: 'AC-2567-017', workStatus: 'คดีถึงที่สุด',
            plaintiff: 'นายอดุลย์ ฯ', defendant: 'สำนักงาน ป.ป.ท.', interpleader: '',
            sourceCase: 'ปปท.29/64', reason: 'ขอให้ชดใช้ค่าเสียหายจากการปฏิบัติหน้าที่',
            responsible: 'นางสาวนิติพร มีไพฑูรย์', receivedDate: '2024-05-14',
            nextDate: null, nextDateNote: '—', year: 2567,
            courtCases: [
                { level: 'ชั้นต้น', court: 'ศาลปกครองขอนแก่น', blackNo: 'บ 17/2567', blackDate: '2024-05-14', redNo: 'บ 52/67', redDate: '2025-09-30', result: 'จำหน่ายคดี' }
            ],
            history: [
                { ts: '2024-05-14', event: 'received', desc: 'รับหมายเรียกศาลปกครองขอนแก่น' },
                { ts: '2024-05-20', event: 'assigned', desc: 'มอบหมาย นางสาวนิติพร มีไพฑูรย์' },
                { ts: '2024-06-05', event: 'in_progress', desc: 'กลุ่มงานคดีจัดทำคำให้การแก้ต่าง' },
                { ts: '2025-09-30', event: 'result', desc: 'ศาลจำหน่ายคดี — ออกเลขคดีแดง บ 52/67' },
                { ts: '2025-10-10', event: 'final', desc: 'คดีถึงที่สุด' }
            ],
            docs: []
        }
    ];


    /*
     * Seed / migration.
     * เดิมตรวจ schema เก่าด้วย `...includes('ธนกร')` ซึ่งใช้ได้ครั้งเดียวและใช้ซ้ำไม่ได้
     * ข้อมูล prototype เป็นข้อมูลปลอมทั้งหมด จึงล้างแล้ว seed ใหม่เมื่อเวอร์ชันไม่ตรง
     * ปลอดภัยกว่าการเขียน migration ทีละฟิลด์ ซึ่งจะทิ้งสถานะครึ่ง ๆ กลาง ๆ ไว้ตอน demo
     */
    const ECMIS_SCHEMA_VERSION = '3';
    if (localStorage.getItem('ecmis_schema_version') !== ECMIS_SCHEMA_VERSION) {
        localStorage.setItem('ecmis_cases101', JSON.stringify(SEED_CASES_101));
        localStorage.setItem('ecmis_appeals102', JSON.stringify(SEED_APPEALS_102));
        localStorage.setItem('ecmis_requests102', JSON.stringify(SEED_REQUESTS_102));
        localStorage.setItem('ecmis_admin_cases103', JSON.stringify(SEED_ADMIN_CASES_103));
        localStorage.setItem('ecmis_schema_version', ECMIS_SCHEMA_VERSION);
    }



    // Stateful Database Objects loaded from storage
    let DB_CASES_101 = JSON.parse(localStorage.getItem('ecmis_cases101'));
    let DB_APPEALS_102 = JSON.parse(localStorage.getItem('ecmis_appeals102'));
    let DB_REQUESTS_102 = JSON.parse(localStorage.getItem('ecmis_requests102'));
    let DB_ADMIN_CASES_103 = JSON.parse(localStorage.getItem('ecmis_admin_cases103'));

    // Data Cleansing: Deduplicate items in localStorage databases
    function cleanseDatabase(db, keyField, storageKey) {
        if (!Array.isArray(db)) return db;
        const unique = [];
        const seen = new Set();
        let changed = false;
        db.forEach(item => {
            if (item && item[keyField]) {
                const key = item[keyField].toString().trim();
                if (!seen.has(key)) {
                    seen.add(key);
                    unique.push(item);
                } else {
                    changed = true;
                }
            } else {
                unique.push(item);
            }
        });
        if (changed) {
            localStorage.setItem(storageKey, JSON.stringify(unique));
            console.log(`[Cleansing] Removed duplicate entries in ${storageKey}`);
            return unique;
        }
        return db;
    }

    function cleanseAdminDatabase(db, storageKey) {
        if (!Array.isArray(db)) return db;
        const unique = [];
        const seenKeys = new Set();
        let changed = false;
        db.forEach(item => {
            if (item && Array.isArray(item.courtCases) && item.courtCases.length > 0) {
                const firstCase = item.courtCases[0];
                const key = `${firstCase.court}_${firstCase.blackNo}`.toLowerCase().replace(/\s/g, '');
                if (!seenKeys.has(key)) {
                    seenKeys.add(key);
                    unique.push(item);
                } else {
                    changed = true;
                }
            } else {
                unique.push(item);
            }
        });
        if (changed) {
            localStorage.setItem(storageKey, JSON.stringify(unique));
            console.log(`[Cleansing] Removed duplicate entries in ${storageKey} based on court + blackNo`);
            return unique;
        }
        return db;
    }

    DB_CASES_101 = cleanseDatabase(DB_CASES_101, 'id', 'ecmis_cases101');
    DB_APPEALS_102 = cleanseDatabase(DB_APPEALS_102, 'id', 'ecmis_appeals102');
    DB_REQUESTS_102 = cleanseDatabase(DB_REQUESTS_102, 'id', 'ecmis_requests102');
    DB_ADMIN_CASES_103 = cleanseAdminDatabase(DB_ADMIN_CASES_103, 'ecmis_admin_cases103');

    let currentSelectedCase = null;
    let currentSelectedDisclosure = null;
    let currentSelectedDisclosureType = 'request';
    let currentSelectedAdminCase = null;
    let activeDisclosureSubTab = 'requests';
    let integrationTargetInputIdMap = {};
    let dashboardCharts = {};

    // Override default alert with SweetAlert2
    window.alert = function(message) {
        let icon = 'info';
        let title = 'แจ้งเตือนระบบ';
        
        if (message.includes('สำเร็จ') || message.includes('เรียบร้อย') || message.includes('เสร็จสิ้น')) {
            icon = 'success';
            title = 'ดำเนินการสำเร็จ';
        } else if (message.includes('กรุณา') || message.includes('ค่าไม่ถูกต้อง') || message.includes('ไม่พบ') || message.includes('อย่างน้อย')) {
            icon = 'warning';
            title = 'แจ้งเตือน';
        }
        
        Swal.fire({
            title: title,
            html: message.replace(/\n/g, '<br>'),
            icon: icon,
            confirmButtonColor: '#1A2F6B',
            confirmButtonText: 'ตกลง'
        });
    };

    function initTheme() {
        const savedTheme = localStorage.getItem('ecmis_theme');
        const themeIcon = document.getElementById('theme-toggle-icon');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            if (themeIcon) {
                themeIcon.className = 'bi bi-sun';
            }
        } else {
            document.body.classList.remove('dark-theme');
            if (themeIcon) {
                themeIcon.className = 'bi bi-moon-stars';
            }
        }
    }

    // No-op stub — Audit Log viewer removed (beyond TOR scope)
    function logAuditEvent(actionType, description) { /* intentionally empty */ }

    function initializeAll() {
        console.log("Initializing E-CMIS Law Page...");
        initTheme();
        
        setupNavigationTriggers();
        setupFormDropdowns();
        
        // Determine active view from browser URL path
        const path = window.location.pathname.toLowerCase();
        let activeViewName = 'dashboard';

        if (path.includes('/court-cases/prosecution-court/detail')) {
            activeViewName = '10.1-detail';
        } else if (path.includes('/court-cases/prosecution-court')) {
            activeViewName = '10.1';
        } else if (path.includes('/court-cases/disclosure/detail')) {
            activeViewName = '10.2-detail';
        } else if (path.includes('/court-cases/disclosure')) {
            activeViewName = '10.2';
        } else if (path.includes('/court-cases/administrative')) {
            activeViewName = '10.3';
        } else if (path.includes('/court-cases/dashboard') || path.includes('/court-cases') || path === '/' || path === '') {
            activeViewName = 'dashboard';
        } else if (path.includes('/analysis/poc')) {
            activeViewName = 'poc';
        } else if (path.includes('/analysis/components-demo')) {
            activeViewName = 'components-demo';
        } else {
            // Fallback checking DOM
            if (document.getElementById('view-10-1-registry') && document.getElementById('view-10-1-registry').classList.contains('active-view')) {
                activeViewName = '10.1';
            } else if (document.getElementById('view-dashboard') && document.getElementById('view-dashboard').classList.contains('active-view')) {
                activeViewName = 'dashboard';
            }
        }
        
        // Initialize view
        switchView(activeViewName);

        // Initialize custom Flatpickr datepickers
        initFlatpickrDatepickers();

        // Initialize custom dropdown selects
        initCustomSelects();

        // Set Last Update text
        const lastUpdateText = document.getElementById('last-update-101');
        if (lastUpdateText) {
            const now = new Date();
            lastUpdateText.innerText = `อัปเดตล่าสุด: ${now.toLocaleDateString('th-TH')} ${now.toLocaleTimeString('th-TH')}`;
        }

        // Sidebar toggle logic
        const toggleBtn = document.querySelector('.sidebar-toggle-btn');
        const layoutContainer = document.querySelector('.layout-container');
        const sidebarOffcanvas = document.getElementById('sidebarOffcanvas');
        
        if (toggleBtn && layoutContainer) {
            // Initialize Bootstrap Tooltips
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
            
            function updateToggleIcon() {
                const icon = toggleBtn.querySelector('i');
                if (!icon) return;
                
                if (window.innerWidth >= 1200) {
                    if (layoutContainer.classList.contains('sidebar-collapsed')) {
                        icon.className = 'bi bi-list';
                    } else {
                        icon.className = 'bi bi-x-lg';
                    }
                } else {
                    if (sidebarOffcanvas && sidebarOffcanvas.classList.contains('show')) {
                        icon.className = 'bi bi-x-lg';
                    } else {
                        icon.className = 'bi bi-list';
                    }
                }
            }

            if (!toggleBtn.__hasToggleListener) {
                toggleBtn.__hasToggleListener = true;
                toggleBtn.addEventListener('click', function (e) {
                    if (window.innerWidth >= 1200) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        layoutContainer.classList.toggle('sidebar-collapsed');
                        const isCollapsed = layoutContainer.classList.contains('sidebar-collapsed');
                        localStorage.setItem('sidebarCollapsed', isCollapsed);
                        
                        updateToggleIcon();
                        
                        tooltipList.forEach(tooltip => {
                            if (isCollapsed) {
                                tooltip.enable();
                            } else {
                                tooltip.disable();
                                tooltip.hide();
                            }
                        });
                    }
                });
            }
            
            if (sidebarOffcanvas && !sidebarOffcanvas.__hasOffcanvasListeners) {
                sidebarOffcanvas.__hasOffcanvasListeners = true;
                sidebarOffcanvas.addEventListener('shown.bs.offcanvas', updateToggleIcon);
                sidebarOffcanvas.addEventListener('hidden.bs.offcanvas', updateToggleIcon);
            }
            
            window.removeEventListener('resize', updateToggleIcon);
            window.addEventListener('resize', updateToggleIcon);
            
            const savedState = localStorage.getItem('sidebarCollapsed');
            if (savedState === 'true' && window.innerWidth >= 1200) {
                layoutContainer.classList.add('sidebar-collapsed');
                tooltipList.forEach(tooltip => tooltip.enable());
            } else {
                layoutContainer.classList.remove('sidebar-collapsed');
                tooltipList.forEach(tooltip => tooltip.disable());
            }
            
            updateToggleIcon();
        }
    }

    // Guard the immediate call: a throw here must not abort the rest of this
    // script (notably the window.switchView export near the bottom), otherwise
    // Blazor's InvokeVoidAsync("switchView") fails with "could not find switchView".
    function safeInitializeAll() {
        try {
            initializeAll();
        } catch (e) {
            console.error('initializeAll() failed:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', safeInitializeAll);
    } else {
        safeInitializeAll();
    }

    // ==============================================
    // 1. STATEFUL VIEW MANAGER & SIDEBAR NAVIGATION
    // ==============================================
    function setupNavigationTriggers() {
        // Navigation and sidebar active states are managed natively by the EcmisSidebar Blazor component.
    }

    function switchView(viewName) {
        document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active-view'));
        
        const breadcrumbRoot = "งานกฎหมายในทางคดี";
        let breadcrumbCurrent = "";
        let newUrl = "";

        if (viewName === '10.1') {
            const el = document.getElementById('view-10-1-registry');
            if (el) el.classList.add('active-view');
            breadcrumbCurrent = "สำนวนคดีชั้นอัยการและชั้นศาล";
            newUrl = "/court-cases/prosecution-court";
            renderCases101Table();
        } else if (viewName === '10.1-detail') {
            const el = document.getElementById('view-10-1-detail');
            if (el) el.classList.add('active-view');
            breadcrumbCurrent = `สำนวนคดี › รายละเอียด (${currentSelectedCase ? currentSelectedCase.id : ''})`;
            newUrl = "/court-cases/prosecution-court/detail";
            renderCaseDetail();
        } else if (viewName === '10.2') {
            const el = document.getElementById('view-10-2-disclosure');
            if (el) el.classList.add('active-view');
            breadcrumbCurrent = "พิจารณาคำร้องขอเปิดเผยข้อมูลข่าวสาร";
            newUrl = "/court-cases/disclosure";
            renderDisclosureTable();
        } else if (viewName === '10.2-detail') {
            const el = document.getElementById('view-10-2-detail');
            if (el) el.classList.add('active-view');
            breadcrumbCurrent = `คำร้องขอข้อมูลข่าวสาร › รายละเอียด (${currentSelectedDisclosure ? currentSelectedDisclosure.id : ''})`;
            newUrl = "/court-cases/disclosure/detail";
            renderDisclosureDetail();
        } else if (viewName === '10.3') {
            const el = document.getElementById('view-10-3-admin-cases');
            if (el) el.classList.add('active-view');
            breadcrumbCurrent = "การจัดการและควบคุมงานคดีปกครอง";
            newUrl = "/court-cases/administrative";
            renderAdminCasesTable();
        } else if (viewName === '10.3-detail') {
            const el = document.getElementById('view-10-3-detail');
            if (el) el.classList.add('active-view');
            const latest = currentSelectedAdminCase ? EcmisDomain.latestCourtCase(currentSelectedAdminCase) : null;
            breadcrumbCurrent = `คดีปกครอง › รายละเอียด (${latest ? toThaiDigits(latest.blackNo) : ''})`;
            newUrl = "/court-cases/administrative/detail";
            renderAdminCaseDetail();
        } else if (viewName === 'dashboard') {
            const el = document.getElementById('view-dashboard');
            if (el) el.classList.add('active-view');
            breadcrumbCurrent = "Dashboard วิเคราะห์สถิติคดี";
            newUrl = "/court-cases";
            if (typeof renderDashboardStatsAndCharts === 'function') renderDashboardStatsAndCharts();
        } else if (viewName === 'poc') {
            const el = document.getElementById('view-poc');
            if (el) el.classList.add('active-view');
            breadcrumbCurrent = "🧪 Proof of Concept (POC) - Library Stack Verification";
            newUrl = "/analysis/poc";
        } else if (viewName === 'components-demo') {
            const el = document.getElementById('view-components-demo');
            if (el) el.classList.add('active-view');
            breadcrumbCurrent = "🧩 Custom Component Library Demo";
            newUrl = "/analysis/components-demo";
        } else {
            // Placeholder for unimplemented paths
            const el = document.getElementById('view-coming-soon');
            if (el) el.classList.add('active-view');
            
            const placeholderNames = {
                '1': 'รับเรื่องร้องเรียน',
                '2': 'แสวงหาข้อเท็จจริง',
                '3': 'วินิจฉัย/สรุปผล',
                '4': 'มติคณะกรรมการ ป.ป.ท.',
                '5': 'ติดตามภายหลังมติ',
                '6': 'การดำเนินการตามหมายจับ',
                'announcements': 'ประกาศ/FAQ/แจ้งปัญหา',
                'web-pr': 'ประชาสัมพันธ์ Web',
                'digital-signature': 'Digital Signature'
            };
            
            breadcrumbCurrent = placeholderNames[viewName] || 'กำลังพัฒนา...';
            newUrl = `/${viewName}`;
            
            const comingSoonText = document.getElementById('coming-soon-text');
            if (comingSoonText) {
                comingSoonText.innerText = `ฟีเจอร์ '${breadcrumbCurrent}' อยู่ระหว่างการออกแบบและพัฒนา`;
            }
        }

        // Dynamically update URL in the address bar without reload
        if (newUrl && window.location.pathname !== newUrl) {
            window.history.pushState(null, "", newUrl);
        }

        const breadcrumbEl = document.getElementById('breadcrumb-current');
        if (breadcrumbEl) {
            breadcrumbEl.innerText = breadcrumbCurrent;
        }
        logAuditEvent('VIEW_NAVIGATION', `เปิดหน้ามุมมอง: ${breadcrumbCurrent}`);
        
        // Re-initialize custom dropdown selects on view switches to capture dynamic components
        initCustomSelects();

        // Re-bind flatpickr date pickers too: Blazor may have replaced the input nodes
        // after prerender, so rebinding here keeps the calendars clickable on the live DOM.
        initFlatpickrDatepickers();
    }

    // ==============================================
    // 2. DATA BINDING - RENDERING DYNAMIC VIEWS
    // ==============================================

    function renderCases101Table() {
        const body = document.getElementById('cases-table-body');
        if (!body) return;
        body.innerHTML = '';
        
        let filtered = DB_CASES_101;
        
        // ผู้ใช้เห็นเลขไทยบนจอ จึงพิมพ์เลขไทยมาค้น แต่ค่าที่เก็บเป็นอารบิก — normalize ก่อนเทียบ
        const search = toArabicDigits(document.getElementById('filter-101-search').value).toLowerCase().trim();
        const type = document.getElementById('filter-101-type').value;
        const step = document.getElementById('filter-101-step').value;
        const office = document.getElementById('filter-101-office').value;
        const responsible = document.getElementById('filter-101-responsible').value;
        
        const dateRangeEl = document.getElementById('filter-101-date-range');
        const startDate = dateRangeEl ? dateRangeEl.dataset.startDate : null;
        const endDate = dateRangeEl ? dateRangeEl.dataset.endDate : null;

        if (search) {
            filtered = filtered.filter(c => 
                c.id.toLowerCase().includes(search) || 
                c.accused.toLowerCase().includes(search) || 
                c.blackId.toLowerCase().includes(search) || 
                c.redId.toLowerCase().includes(search)
            );
        }
        if (type) filtered = filtered.filter(c => c.type === type);
        if (step) {
            if (step === 'อัยการ') filtered = filtered.filter(c => c.step <= 3 || c.status.includes('อัยการ'));
            else if (step === 'ศาล') filtered = filtered.filter(c => c.step === 4 || c.step === 5 || c.status.includes('ศาล'));
            else if (step === 'สิ้นสุด') filtered = filtered.filter(c => c.step === 7 || c.status.includes('สิ้นสุด') || c.status.includes('ถึงที่สุด'));
        }
        if (office) filtered = filtered.filter(c => c.office === office);
        if (responsible) filtered = filtered.filter(c => c.responsible === responsible);
        if (startDate && endDate) {
            filtered = filtered.filter(c => c.dueDate >= startDate && c.dueDate <= endDate);
        }

        renderKPIs101();

        filtered.sort((a, b) => {
            const pA = calculatePriority(a, '10.1');
            const pB = calculatePriority(b, '10.1');
            return pB.rank - pA.rank;
        });

        if (filtered.length === 0) {
            body.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">ไม่พบข้อมูลสำนวนคดีตามที่ค้นหา</td></tr>`;
            return;
        }

        filtered.forEach(c => {
            const tr = document.createElement('tr');
            
            const dateDiff = Math.ceil((new Date(c.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            let ageHtml = '';
            if (c.status === 'คดีถึงที่สุด' || c.status === 'ปิดสำนวน' || dateDiff < 0) {
                ageHtml = '<div class="text-value fw-normal">สิ้นสุดแล้ว</div>';
            } else if (dateDiff <= 30) {
                ageHtml = `<div class="text-value fw-bold text-danger">อีก ${dateDiff} วัน!</div>`;
            } else {
                ageHtml = `<div class="text-value fw-normal">${formatDateThai(c.dueDate)}</div>`;
            }

            let badgeClass = 'status-navy';
            if (c.status.includes('ศาล')) badgeClass = 'status-orange';
            else if (c.status.includes('อัยการ')) badgeClass = 'status-teal';
            else if (c.status.includes('ถึงที่สุด') || c.status.includes('ปิด')) badgeClass = 'status-green';
            else if (c.status.includes('อายุความ') || c.status.includes('ด่วน')) badgeClass = 'status-red';

            tr.innerHTML = `
                <td><div class="fw-bold text-value" style="color: var(--primary-light);">${toThaiDigits(c.id)}</div></td>
                <td><div class="text-value fw-normal">${c.type}</div></td>
                <td>
                    <div class="text-value fw-normal">${c.accuser}</div>
                    <div class="text-sub">${c.accused}</div>
                </td>
                <td>
                    <div>${caseNoHtml(c.blackId, 'black')}</div>
                    <div style="margin-top:2px;">${caseNoHtml(c.redId, 'red')}</div>
                </td>
                <td>
                    <div class="text-value fw-normal">${c.office}</div>
                </td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="avatar-sm">${c.responsible.charAt(0)}</div>
                        <span class="text-value fw-normal">${c.responsible}</span>
                    </div>
                </td>
                <td><div class="status-badge ${badgeClass}">${c.status}</div></td>
                <td>${ageHtml}</td>
                <td>
                    <div class="d-flex gap-1">
                        <button class="btn btn-action-view" onclick="selectAndShowCaseDetail('${c.id}')">ดู/แก้ไข</button>
                    </div>
                </td>
            `;
            body.appendChild(tr);
        });
    }

    function renderKPIs101() {
        const container = document.getElementById('kpi-cards-101');
        if (!container) return;

        const total = DB_CASES_101.length;
        const prosecutionCount = DB_CASES_101.filter(c => c.status.includes('อัยการ') || c.step <= 3).length;
        const courtCount = DB_CASES_101.filter(c => c.status.includes('ศาล') || c.step === 4 || c.step === 5).length;
        const pendingCount = prosecutionCount + courtCount;
        let urgentCount = 0;
        DB_CASES_101.forEach(c => {
            const dateDiff = Math.ceil((new Date(c.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            if (dateDiff > 0 && dateDiff <= 30 && c.status !== 'คดีถึงที่สุด') {
                urgentCount++;
            }
        });
        const completedCount = DB_CASES_101.filter(c => c.status === 'คดีถึงที่สุด').length;

        container.innerHTML = `
            <div class="col-6 col-md-3">
                <div class="sc-header-card sc-navy">
                    <div class="card-banner">สำนวนทั้งหมด</div>
                    <div class="card-num">${total}</div>
                    <div class="card-sub">รายการ</div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="sc-header-card sc-orange">
                    <div class="card-banner">รอดำเนินการ</div>
                    <div class="card-num">${pendingCount}</div>
                    <div class="card-sub">รายการ</div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="sc-header-card sc-red">
                    <div class="card-banner">ใกล้ครบกำหนดเวลา</div>
                    <div class="card-num">${urgentCount}</div>
                    <div class="card-sub">รายการเร่งด่วน</div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="sc-header-card sc-teal">
                    <div class="card-banner">คดีถึงที่สุด</div>
                    <div class="card-num">${completedCount}</div>
                    <div class="card-sub">คดีเสร็จสิ้น</div>
                </div>
            </div>
        `;
    }

    function selectAndShowCaseDetail(caseId) {
        currentSelectedCase = DB_CASES_101.find(c => c.id === caseId);
        switchView('10.1-detail');
    }

    function changeCaseStep(caseId, targetStep) {
        const c = DB_CASES_101.find(item => item.id === caseId);
        if (!c) return;

        const stepNames = [
            'รับสำนวน',
            'ลงทะเบียน/มอบหมาย',
            'ตรวจสอบสำนวน',
            'ความเห็น + e-Approval',
            'มติบอร์ด ป.ป.ท.',
            'อสส. ชี้ขาด',
            'ปิดสำนวน'
        ];

        const stepStatuses = [
            'รับสำนวน',
            'ลงทะเบียนมอบหมายสำนวน',
            'รอคำวินิจฉัยอัยการ',
            'อยู่ระหว่างศาลชั้นต้น',
            'รอมติบอร์ด ป.ป.ท.',
            'อสส. ชี้ขาด',
            'คดีถึงที่สุด'
        ];

        const stepName = stepNames[targetStep - 1];
        const newStatus = stepStatuses[targetStep - 1];

        Swal.fire({
            title: 'เปลี่ยนขั้นตอนสำนวน',
            text: `ต้องการเปลี่ยนขั้นตอนสำนวนคดีนี้เป็น '${stepName}' หรือไม่?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1A2F6B',
            cancelButtonColor: '#6B7A99',
            confirmButtonText: 'ใช่, เปลี่ยนขั้นตอน',
            cancelButtonText: 'ยกเลิก'
        }).then(result => {
            if (result.isConfirmed) {
                const ts = new Date().toLocaleDateString('th-TH');
                c.step = targetStep;
                c.status = newStatus;
                c.timeline.push({ date: ts, desc: `เปลี่ยนขั้นตอนเป็น: ${stepName} (${newStatus})` });
                
                saveDatabase101();
                logAuditEvent('CASE_STEP_CHANGE', `เปลี่ยนขั้นตอนสำนวน ${caseId} เป็น ${stepName}`);
                
                Swal.fire({
                    title: 'สำเร็จ!',
                    text: `เปลี่ยนขั้นตอนเป็น '${stepName}' เรียบร้อยแล้ว`,
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true
                });

                renderCaseDetail();
            }
        });
    }

    function renderCaseDetail() {
        if (!currentSelectedCase) {
            // Fallback to list view if accessed directly via URL without a selected case
            console.warn('No case selected, redirecting to list view');
            switchView('10.1');
            return;
        }
        const c = currentSelectedCase;

        document.getElementById('detail-case-no').innerText = toThaiDigits(c.id);
        document.getElementById('detail-case-type').innerText = c.type;
        document.getElementById('detail-case-status').innerText = c.status;

        const dateDiff = Math.ceil((new Date(c.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
        const remElement = document.getElementById('detail-case-remaining');
        const alarmDays = document.getElementById('alarm-days');
        const alarmDate = document.getElementById('alarm-date');
        const alarmBar = document.getElementById('alarm-bar');

        if (dateDiff < 0) {
            remElement.innerText = "อายุความสิ้นสุดแล้ว";
            remElement.className = "status-badge status-navy";
            alarmDays.innerText = "0";
            alarmDate.innerText = formatDateThai(c.dueDate);
            alarmBar.style.width = '100%';
            alarmBar.className = 'progress-bar bg-secondary';
        } else {
            remElement.innerText = `อายุความคงเหลือ ${dateDiff} วัน`;
            remElement.className = dateDiff <= 30 ? "status-badge status-red" : "status-badge status-yellow";
            alarmDays.innerText = dateDiff;
            alarmDate.innerText = formatDateThai(c.dueDate);
            
            const totalAgeDays = 365;
            const progressPercent = Math.max(0, Math.min(100, (1 - (dateDiff / totalAgeDays)) * 100));
            alarmBar.style.width = `${progressPercent}%`;
            alarmBar.className = dateDiff <= 30 ? 'progress-bar bg-danger' : 'progress-bar bg-warning';
        }

        document.getElementById('detail-case-parties').innerHTML =
            `ผู้กล่าวหา: ${c.accuser} · ผู้ถูกกล่าวหา: ${c.accused} · คดีดำ ${caseNoHtml(c.blackId, 'black')} · คดีแดง ${caseNoHtml(c.redId, 'red')}`;
        document.getElementById('detail-case-court').innerText = `${c.court} · ผู้รับผิดชอบ: ${c.responsible}`;

        const stepperFill = document.getElementById('detail-stepper-fill');
        const activeStep = c.step || 1;
        const progressPercentage = ((activeStep - 1) / 6) * 100;
        stepperFill.style.width = `${progressPercentage}%`;

        for (let i = 1; i <= 7; i++) {
            const stepEl = document.getElementById(`step-${i}`);
            if (stepEl) {
                if (i < activeStep) {
                    stepEl.className = 'step-item completed';
                    stepEl.querySelector('.step-circle').innerHTML = '<i class="bi bi-check-lg"></i>';
                } else if (i === activeStep) {
                    stepEl.className = 'step-item active';
                    stepEl.querySelector('.step-circle').innerText = i;
                } else {
                    stepEl.className = 'step-item';
                    stepEl.querySelector('.step-circle').innerText = i;
                }
                
                // Make stepper items interactive to update status
                stepEl.style.cursor = 'pointer';
                stepEl.title = 'คลิกเพื่อเปลี่ยนขั้นตอนการดำเนินคดี';
                stepEl.onclick = () => changeCaseStep(c.id, i);
            }
        }

        document.getElementById('meta-type').innerText = c.type;
        document.getElementById('meta-no').innerText = toThaiDigits(c.id);
        document.getElementById('meta-blackred').innerHTML = `${caseNoHtml(c.blackId, 'black')} · ${caseNoHtml(c.redId, 'red')}`;
        document.getElementById('meta-date').innerText = c.timeline[0] ? c.timeline[0].date : '—';
        document.getElementById('meta-attorney').innerText = c.office;
        document.getElementById('meta-court').innerText = c.court;
        document.getElementById('meta-division').innerText = 'กองกฎหมาย กลุ่มงานคดี';
        document.getElementById('meta-due').innerText = formatDateThai(c.dueDate);

        const partiesBody = document.getElementById('detail-parties-body');
        partiesBody.innerHTML = `
            <tr>
                <td><span class="text-primary fw-bold">ผู้กล่าวหา</span></td>
                <td>${c.accuser}</td>
                <td>—</td>
                <td><span class="badge bg-secondary">โจทก์</span></td>
            </tr>
            <tr>
                <td><span class="text-danger fw-bold">ผู้ถูกกล่าวหา</span></td>
                <td>${c.accused}</td>
                <td>3-1002-xxxxx-xx-1</td>
                <td><span class="badge bg-dark">จำเลยที่ 1</span></td>
            </tr>
        `;

        const docsList = document.getElementById('detail-docs-list');
        docsList.innerHTML = '';
        if (!c.docs || c.docs.length === 0) {
            docsList.innerHTML = '<div class="text-center py-3 text-muted">ไม่มีไฟล์เอกสารแนบในขณะนี้</div>';
        } else {
            c.docs.forEach((doc, idx) => {
                const item = document.createElement('div');
                item.className = 'list-group-item d-flex justify-content-between align-items-center border-0 border-bottom px-0 py-2';
                
                const ext = doc.name.split('.').pop().toUpperCase();
                const badgeColor = ext === 'PDF' ? 'bg-danger' : 'bg-primary';

                item.innerHTML = `
                    <div class="d-flex align-items-center gap-3">
                        <div class="badge ${badgeColor} d-flex align-items-center justify-content-center" style="width:36px; height:36px; font-size:10px;">${ext}</div>
                        <div>
                            <div class="fw-bold" style="font-size:13px;">${doc.name}</div>
                            <div class="text-sub">${doc.size} · ${doc.uploader} · ${doc.date}</div>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline-navy py-1 px-3" onclick="simulateFileDownload('${doc.name}')">ดาวน์โหลด</button>
                `;
                docsList.appendChild(item);
            });
        }

        const auditTrailContainer = document.getElementById('detail-audit-trail');
        auditTrailContainer.innerHTML = '';
        if (c.timeline && c.timeline.length > 0) {
            c.timeline.forEach((t, index) => {
                const isLast = index === c.timeline.length - 1;
                const div = document.createElement('div');
                div.className = `audit-item ${isLast ? 'active' : ''}`;
                div.innerHTML = `
                    <div class="text-sub font-monospace">${t.date}</div>
                    <div class="fw-bold mt-1 text-dark" style="font-size:12px;">${t.desc}</div>
                `;
                auditTrailContainer.appendChild(div);
            });
        }
    }


    // ==============================================
    // 3. 10.2 DISCLOSURE REQUESTS & APPEALS TAB BINDING
    // ==============================================
    function toggleDisclosureSubTab(tabName) {
        activeDisclosureSubTab = tabName;
        
        const btnRequests = document.getElementById('tab-disclosure-requests');
        const btnAppeals = document.getElementById('tab-disclosure-appeals');
        const tableTitle = document.getElementById('table-title-102');
        const btnAdd = document.getElementById('btn-add-102');

        if (tabName === 'requests') {
            btnRequests.classList.add('active');
            btnAppeals.classList.remove('active');
            tableTitle.innerText = "รายการคำร้องขอข้อมูลข่าวสาร (LAW002.01)";
            btnAdd.innerText = "+ รับคำร้องใหม่";
            btnAdd.setAttribute('data-bs-target', '#newAppealModal');
        } else {
            btnRequests.classList.remove('active');
            btnAppeals.classList.add('active');
            tableTitle.innerText = "รายการคำอุทธรณ์คำสั่งไม่เปิดเผย (LAW002.02)";
            btnAdd.innerText = "+ รับคำอุทธรณ์ใหม่";
        }

        renderDisclosureTable();
    }

    function renderDisclosureTable() {
        renderKPIs102();

        const head = document.getElementById('disclosure-table-head');
        const body = document.getElementById('disclosure-table-body');
        if (!body) return;
        
        body.innerHTML = '';

        const search = toArabicDigits(document.getElementById('filter-102-search').value).toLowerCase().trim();
        const status = document.getElementById('filter-102-status').value;
        const result = document.getElementById('filter-102-result').value;

        const dateRangeEl = document.getElementById('filter-102-date-range');
        const startDate = dateRangeEl ? dateRangeEl.dataset.startDate : null;
        const endDate = dateRangeEl ? dateRangeEl.dataset.endDate : null;

        if (activeDisclosureSubTab === 'requests') {
            head.innerHTML = `
                <tr>
                    <th>เลขสำนวนคำร้อง</th>
                    <th>ชื่อผู้ร้องขอข้อมูล</th>
                    <th>กอง/สำนักเจ้าของเรื่อง</th>
                    <th>วันที่รับ</th>
                    <th>ครบกำหนดพิจารณา</th>
                    <th>ผลการพิจารณา</th>
                    <th>สถานะการดำเนินการ</th>
                    <th>ไฟล์แนบ</th>
                    <th>จัดการ</th>
                </tr>
            `;

            let filtered = DB_REQUESTS_102;
            if (search) {
                filtered = filtered.filter(r => 
                    r.id.toLowerCase().includes(search) || 
                    r.name.toLowerCase().includes(search) || 
                    r.division.toLowerCase().includes(search)
                );
            }
            if (status) filtered = filtered.filter(r => r.status.includes(status));
            if (result) filtered = filtered.filter(r => r.decision.includes(result));
            if (startDate && endDate) {
                filtered = filtered.filter(r => r.receivedDate >= startDate && r.receivedDate <= endDate);
            }

            filtered.sort((a, b) => {
                const pA = calculatePriority(a, '10.2');
                const pB = calculatePriority(b, '10.2');
                return pB.rank - pA.rank;
            });

            if (filtered.length === 0) {
                body.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">ไม่พบข้อมูลคำร้องขอข้อมูลข่าวสาร</td></tr>`;
                return;
            }

            filtered.forEach(r => {
                const tr = document.createElement('tr');
                
                let badgeClass = 'status-navy';
                if (r.status.includes('แล้ว')) badgeClass = 'status-green';
                else if (r.status.includes('เกิน')) badgeClass = 'status-red';

                tr.innerHTML = `
                    <td><div class="fw-bold text-value" style="color: var(--primary-light);">${toThaiDigits(r.id)}</div></td>
                    <td><div class="text-value fw-normal">${r.name}</div></td>
                    <td><div class="text-value fw-normal">${r.division}</div></td>
                    <td><div class="text-value fw-normal">${formatDateThai(r.receivedDate)}</div></td>
                    <td><div class="text-value fw-normal">${formatDateThai(r.dueDate)}</div></td>
                    <td><div class="status-badge ${r.decision === 'เปิดเผย' ? 'status-teal' : (r.decision === 'ไม่เปิดเผย' ? 'status-red' : 'status-navy')}">${r.decision || '—'}</div></td>
                    <td><div class="status-badge ${badgeClass}">${r.status}</div></td>
                    <td><span class="text-value fw-bold"><i class="bi bi-file-earmark-pdf"></i> ${r.docsCount || 0}</span></td>
                    <td>
                        <div class="d-flex gap-1">
                            <button class="btn btn-action-view" onclick="simulateDisclosureDetail('${r.id}')">ดู</button>
                            <button class="btn btn-action-save" onclick="openRecordResultModal102('${r.id}', 'request')">บันทึกผล</button>
                        </div>
                    </td>
                `;
                body.appendChild(tr);
            });
        } else {
            head.innerHTML = `
                <tr>
                    <th>เลขที่อุทธรณ์</th>
                    <th>ชื่อผู้อุทธรณ์</th>
                    <th>อ้างอิงคำร้องเดิม</th>
                    <th>รับ / ครบกำหนด</th>
                    <th>ความเห็นเลขาธิการ</th>
                    <th>มติคณะกรรมการ ป.ป.ท.</th>
                    <th>ไฟล์แนบ</th>
                    <th>สถานะ</th>
                    <th>เปิดเผยสาธารณะ</th>
                    <th>จัดการ</th>
                </tr>
            `;

            let filtered = DB_APPEALS_102;
            if (search) {
                filtered = filtered.filter(a => 
                    a.id.toLowerCase().includes(search) || 
                    a.name.toLowerCase().includes(search) || 
                    a.sourceNo.toLowerCase().includes(search)
                );
            }
            if (status) filtered = filtered.filter(a => a.status.includes(status));
            if (result) filtered = filtered.filter(a => a.boardDecision.includes(result) || a.sgOpinion.includes(result));
            if (startDate && endDate) {
                filtered = filtered.filter(a => a.receivedDate >= startDate && a.receivedDate <= endDate);
            }

            filtered.sort((a, b) => {
                const pA = calculatePriority(a, '10.2');
                const pB = calculatePriority(b, '10.2');
                return pB.rank - pA.rank;
            });

            if (filtered.length === 0) {
                body.innerHTML = `<tr><td colspan="10" class="text-center text-muted py-4">ไม่พบข้อมูลคำอุทธรณ์</td></tr>`;
                return;
            }

            filtered.forEach(a => {
                const tr = document.createElement('tr');
                
                let badgeClass = 'status-navy';
                if (a.status.includes('แล้ว')) badgeClass = 'status-green';
                else if (a.status.includes('เกิน')) badgeClass = 'status-red';
                else if (a.status.includes('บอร์ด')) badgeClass = 'status-yellow';

                tr.innerHTML = `
                    <td><div class="fw-bold text-value" style="color: var(--primary-light);">${toThaiDigits(a.id)}</div></td>
                    <td><div class="text-value fw-normal">${a.name}</div></td>
                    <td><div class="text-value fw-normal text-decoration-underline" style="color:var(--primary-light); cursor:pointer;" onclick="simulateDisclosureDetail('${a.sourceNo}')">${toThaiDigits(a.sourceNo)}</div></td>
                    <td>
                        <div class="text-value fw-normal">${formatDateThai(a.receivedDate)}</div>
                        <div class="text-sub text-danger text-value">ครบ ${formatDateThai(a.dueDate)}</div>
                    </td>
                    <td><div class="status-badge ${a.sgOpinion.includes('ยืน') ? 'status-red' : (a.sgOpinion.includes('เปิด') ? 'status-teal' : 'status-navy')}">${a.sgOpinion}</div></td>
                    <td><div class="status-badge ${a.boardDecision.includes('เห็นชอบ') ? 'status-teal' : (a.boardDecision.includes('ยืน') ? 'status-red' : 'status-navy')}">${a.boardDecision}</div></td>
                    <td><span class="text-value fw-bold"><i class="bi bi-file-earmark-pdf"></i> ${a.docsCount || 0}</span></td>
                    <td><div class="status-badge ${badgeClass}">${a.status}</div></td>
                    <td>
                        <div class="form-check form-switch d-flex justify-content-center">
                            <input class="form-check-input" type="checkbox" role="switch" ${a.isPublic ? 'checked' : ''} onchange="toggleAppealPublic('${a.id}', this.checked)">
                        </div>
                    </td>
                    <td>
                        <div class="d-flex gap-1">
                            <button class="btn btn-action-view" onclick="simulateDisclosureDetail('${a.id}')">ดู</button>
                            <button class="btn btn-action-save" onclick="openRecordResultModal102('${a.id}', 'appeal')">บันทึกผล</button>
                        </div>
                    </td>
                `;
                body.appendChild(tr);
            });
        }
    }

    function renderKPIs102() {
        const container = document.getElementById('kpi-cards-102');
        if (!container) return;

        const reqCount = DB_REQUESTS_102.length;
        const appCount = DB_APPEALS_102.length;
        const pendingSgCount = DB_APPEALS_102.filter(a => a.status === 'รอเสนอเลขาธิการ').length;
        const pendingBoardCount = DB_APPEALS_102.filter(a => a.status === 'รอบอร์ดพิจารณา').length;
        const overdueCount = DB_REQUESTS_102.filter(r => r.status.includes('เกิน')).length + DB_APPEALS_102.filter(a => a.status.includes('เกิน')).length;

        container.innerHTML = `
            <div class="col-6 col-md-3">
                <div class="sc-header-card sc-navy">
                    <div class="card-banner">คำร้อง / คำอุทธรณ์ทั้งหมด</div>
                    <div class="card-num">${reqCount + appCount}</div>
                    <div class="card-sub">คำร้อง ${reqCount} · อุทธรณ์ ${appCount}</div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="sc-header-card sc-orange">
                    <div class="card-banner">รอเสนอเลขาธิการพิจารณา</div>
                    <div class="card-num">${pendingSgCount}</div>
                    <div class="card-sub">รอเสนอพิจารณา</div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="sc-header-card sc-teal">
                    <div class="card-banner">รอบอร์ดพิจารณา (อนุกลั่นกรอง)</div>
                    <div class="card-num">${pendingBoardCount}</div>
                    <div class="card-sub">วาระประชุมบอร์ด</div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="sc-header-card ${overdueCount > 0 ? 'sc-red' : 'sc-navy'}">
                    <div class="card-banner">เกินกำหนดระยะเวลาดำเนินงาน</div>
                    <div class="card-num">${overdueCount}</div>
                    <div class="card-sub">${overdueCount > 0 ? 'เกินกำหนด' : 'ปกติ'}</div>
                </div>
            </div>
        `;
    }

    function toggleAppealPublic(appealId, val) {
        const a = DB_APPEALS_102.find(ap => ap.id === appealId);
        if (a) {
            a.isPublic = val;
            saveDatabase102();
            logAuditEvent('SECURITY_PERMISSION', `เปลี่ยนสิทธิ์การเข้าถึงแบบเปิดเผยสาธารณะของอุทธรณ์ ${appealId} เป็น ${val}`);
        }
    }

    // ==============================================
    // 8. DYNAMIC FORM SUBMISSIONS (CRUD STATE)
    // ==============================================
    function submitNewCase(e) {
        e.preventDefault();
        
        // เจ้าหน้าที่อาจพิมพ์เลขไทย — เก็บเป็นอารบิกเสมอ เพราะ id คือ primary key
        const id = toArabicDigits(document.getElementById('form-101-no').value).trim();
        const type = document.getElementById('form-101-type').value;
        const blackId = toArabicDigits(document.getElementById('form-101-black').value).trim() || '—';
        const redId = toArabicDigits(document.getElementById('form-101-red').value).trim() || '—';
        const accuser = document.getElementById('form-101-accuser').value.trim() || 'ป.ป.ท.';
        const accused = document.getElementById('form-101-accused').value.trim();
        const attorney = document.getElementById('form-101-attorney').value.trim() || 'สนง.อัยการปราบฯ กลาง';
        const court = document.getElementById('form-101-court').value.trim() || 'ศาลอาญาคดีทุจริตฯ กลาง';
        const responsible = document.getElementById('form-101-responsible').value;
        const dueDate = document.getElementById('form-101-due').value;

        // flatpickr's altInput hides the real input, so its `required` is never enforced
        if (!dueDate) {
            alert('กรุณาระบุระยะเวลาอายุความสิ้นสุด');
            return;
        }

        // Check for duplicate ID
        if (DB_CASES_101.some(c => c.id === id)) {
            Swal.fire({
                title: 'ลงทะเบียนไม่สำเร็จ',
                text: `เลขสำนวน ${id} ได้รับการลงทะเบียนไว้แล้วในระบบ!`,
                icon: 'error',
                confirmButtonColor: '#1A2F6B',
                confirmButtonText: 'ตกลง'
            });
            return;
        }

        const newCase = {
            id, type, accuser, accused, blackId, redId,
            office: attorney, court, responsible,
            status: 'ลงทะเบียนมอบหมายสำนวน',
            dueDate, step: 2,
            timeline: [{ date: new Date().toLocaleDateString('th-TH'), desc: 'ลงทะเบียนมอบหมายสำนวนเข้าสารบบ ป.ป.ท.' }],
            docs: []
        };

        DB_CASES_101.unshift(newCase);
        saveDatabase101();
        
        logAuditEvent('CASE_REGISTRY_CREATE', `ลงทะเบียนรับสำนวนคดีใหม่เข้าสารบบ: เลขสำนวน ${id}`);
        
        bootstrap.Modal.getInstance(document.getElementById('newCaseModal')).hide();
        resetFormAndPickers('new-case-form', 'form-101-due');

        Swal.fire({
            title: 'บันทึกสำเร็จ!',
            text: 'ลงทะเบียนสำนวนคดีใหม่เรียบร้อยแล้ว',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
        });
        renderCases101Table();
    }

    function submitNewAppeal(e) {
        e.preventDefault();

        const type = document.getElementById('form-102-type').value;
        const id = toArabicDigits(document.getElementById('form-102-no').value).trim();
        const name = document.getElementById('form-102-name').value.trim();
        const division = document.getElementById('form-102-division').value.trim();
        const detail = document.getElementById('form-102-detail').value.trim();
        const responsible = document.getElementById('form-102-responsible').value;
        const receivedDate = document.getElementById('form-102-received').value;
        const duration = parseInt(document.getElementById('form-102-duration').value, 10);

        // flatpickr's altInput turns the real input into type=hidden, which browsers
        // exclude from constraint validation — so `required` never fires here.
        if (!receivedDate || !Number.isFinite(duration)) {
            alert('กรุณาระบุวันที่ได้รับคำร้อง และระยะเวลาดำเนินการ');
            return;
        }

        const due = new Date(receivedDate);
        due.setDate(due.getDate() + duration);
        const dueDateStr = due.toISOString().split('T')[0];

        if (type === 'คำร้องขอข้อมูล') {
            // Check for duplicate ID
            if (DB_REQUESTS_102.some(r => r.id === id)) {
                Swal.fire({
                    title: 'ลงทะเบียนไม่สำเร็จ',
                    text: `เลขคำร้อง ${id} ได้รับการรับเรื่องไว้แล้วในระบบ!`,
                    icon: 'error',
                    confirmButtonColor: '#1A2F6B',
                    confirmButtonText: 'ตกลง'
                });
                return;
            }
            const newReq = {
                id, type, name, division, detail, responsible,
                receivedDate, dueDate: dueDateStr, decision: '—', status: 'รอเสนอ', docsCount: 1
            };
            DB_REQUESTS_102.unshift(newReq);
            saveDatabase102();
            logAuditEvent('DISCLOSURE_REQUEST_CREATE', `รับคำร้องขอข้อมูลข่าวสารใหม่: เลขที่ ${id}`);
        } else {
            // Check for duplicate ID
            if (DB_APPEALS_102.some(a => a.id === id)) {
                Swal.fire({
                    title: 'ลงทะเบียนไม่สำเร็จ',
                    text: `เลขคำอุทธรณ์ ${id} ได้รับการรับเรื่องไว้แล้วในระบบ!`,
                    icon: 'error',
                    confirmButtonColor: '#1A2F6B',
                    confirmButtonText: 'ตกลง'
                });
                return;
            }
            const newApp = {
                id, type, name, division, detail, responsible,
                sourceNo: 'สขร. ' + (id.split(' ')[1] || '000/69'),
                receivedDate, dueDate: dueDateStr, sgOpinion: '—', boardDecision: '—', docsCount: 2, status: 'รอเสนอเลขาธิการ', isPublic: false
            };
            DB_APPEALS_102.unshift(newApp);
            saveDatabase102();
            logAuditEvent('DISCLOSURE_APPEAL_CREATE', `รับคำอุทธรณ์คําสั่งไม่เปิดเผยข้อมูลใหม่: เลขที่ ${id}`);
        }

        bootstrap.Modal.getInstance(document.getElementById('newAppealModal')).hide();
        resetAppealForm();

        Swal.fire({
            title: 'บันทึกสำเร็จ!',
            text: 'บันทึกรับเรื่องเข้าสารบบข้อมูลข่าวสารเรียบร้อยแล้ว',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
        });
        renderDisclosureTable();
    }

    // form.reset() does not clear a flatpickr altInput, leaving the previous date visible
    function resetFormAndPickers(formId, ...pickerIds) {
        const form = document.getElementById(formId);
        if (form) form.reset();
        pickerIds.forEach(id => {
            const el = document.getElementById(id);
            if (el && el._flatpickr) el._flatpickr.clear();
        });
    }
    function resetAppealForm() {
        resetFormAndPickers('new-appeal-form', 'form-102-received');
    }

    function submitNewAdminCase(e) {
        e.preventDefault();

        const blackNo = toArabicDigits(document.getElementById('form-103-black').value).trim();
        const redNo = toArabicDigits(document.getElementById('form-103-red').value).trim();
        const court = document.getElementById('form-103-court').value;
        const level = document.getElementById('form-103-type').value;
        const plaintiff = document.getElementById('form-103-plaintiff').value.trim();
        const defendant = document.getElementById('form-103-defendant').value.trim();
        const interpleaderEl = document.getElementById('form-103-interpleader');
        const interpleader = interpleaderEl ? interpleaderEl.value.trim() : '';
        const sourceEl = document.getElementById('form-103-source');
        const sourceCase = (sourceEl ? toArabicDigits(sourceEl.value).trim() : '') || '—';
        const responsible = document.getElementById('form-103-responsible').value;
        const year = parseInt(document.getElementById('form-103-year').value, 10);
        const nextDate = document.getElementById('form-103-date').value || null;
        const reason = document.getElementById('form-103-reason').value.trim();

        const today = new Date().toISOString().split('T')[0];

        // Check duplicate court + blackNo
        const exists = DB_ADMIN_CASES_103.some(c => 
            c.courtCases.some(cc => cc.blackNo === blackNo && cc.court === court)
        );
        if (exists) {
            Swal.fire({
                title: 'ลงทะเบียนไม่สำเร็จ',
                text: `เลขคดีดำ ${blackNo} ที่ศาล ${court} ได้รับการลงทะเบียนไว้แล้วในระบบ!`,
                icon: 'error',
                confirmButtonColor: '#1A2F6B',
                confirmButtonText: 'ตกลง'
            });
            return;
        }

        // id เป็นคีย์สังเคราะห์ ไม่ใช่เลขคดีดำ — คดีได้เลขดำใหม่ทุกชั้นศาล
        const newAdmin = {
            id: `AC-${year}-${Date.now().toString().slice(-6)}`,
            workStatus: 'รับหมายเรียก',
            plaintiff, defendant, interpleader, sourceCase, reason, responsible,
            receivedDate: today,
            nextDate, nextDateNote: nextDate ? '' : 'รอนัดหมายแรก',
            year,
            courtCases: [{
                level, court, blackNo, blackDate: today,
                // เลขแดงกรอกได้เฉพาะกรณี backfill คดีเก่าที่ศาลตัดสินไปแล้ว
                redNo: redNo || null, redDate: redNo ? today : null, result: null
            }],
            history: [{ ts: today, event: 'received', desc: `รับหมายเรียก${court}` }],
            docs: []
        };

        DB_ADMIN_CASES_103.unshift(newAdmin);
        saveDatabase103();

        logAuditEvent('ADMIN_CASE_CREATE', `บันทึกหมายเรียกศาลปกครองคดีใหม่: หมายเลขคดีดำ ${blackNo}`);

        bootstrap.Modal.getInstance(document.getElementById('newAdminCaseModal')).hide();
        resetFormAndPickers('new-admin-case-form', 'form-103-date');

        Swal.fire({
            title: 'บันทึกสำเร็จ!',
            text: 'บันทึกคดีปกครองใหม่เข้าระบบสำเร็จ',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
        });
        renderAdminCasesTable();
    }

    // ==============================================
    // 11. EXPORTS GENERATOR & REPORTS PREVIEW
    // ==============================================
    function generateReportPreview() {
        const format = document.getElementById('report-format-select').value;
        const container = document.getElementById('report-preview-container');
        container.innerHTML = '';
        container.style.display = 'block';

        const now = new Date();

        if (format === 'quantitative') {
            container.innerHTML = `
                <div class="text-center mb-4">
                    <h5 class="fw-bold mb-1">รายงานสถิติตัวเลขสำนวนและการดำเนินคดีแยกตามศาล/กอง</h5>
                    <div style="font-size:12px;" class="text-muted">ปีงบประมาณ 2569 · จัดทำ ณ วันที่ ${now.toLocaleDateString('th-TH')}</div>
                </div>
                <table class="table table-bordered align-middle text-center" style="font-size:12px;">
                    <thead class="table-dark">
                        <tr>
                            <th>ประเภทคดี / หน่วยงาน</th>
                            <th>ทั้งหมด (เรื่อง)</th>
                            <th>อยู่ระหว่างดำเนินการ</th>
                            <th>ดำเนินการเสร็จสิ้น</th>
                            <th>ชนะคดี / ยอมรับอุทธรณ์</th>
                            <th>แพ้คดี / ยกอุทธรณ์</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="text-start fw-bold">สำนวนชั้นอัยการ/ศาล (10.1)</td>
                            <td>${DB_CASES_101.length}</td>
                            <td>${DB_CASES_101.filter(c => c.status !== 'คดีถึงที่สุด').length}</td>
                            <td>${DB_CASES_101.filter(c => c.status === 'คดีถึงที่สุด').length}</td>
                            <td>—</td>
                            <td>—</td>
                        </tr>
                        <tr>
                            <td class="text-start fw-bold">คำร้องขอข้อมูลข่าวสาร (10.2)</td>
                            <td>${DB_REQUESTS_102.length}</td>
                            <td>${DB_REQUESTS_102.filter(r => r.status !== 'แจ้งผลแล้ว').length}</td>
                            <td>${DB_REQUESTS_102.filter(r => r.status === 'แจ้งผลแล้ว').length}</td>
                            <td>${DB_REQUESTS_102.filter(r => r.decision === 'เปิดเผย').length}</td>
                            <td>${DB_REQUESTS_102.filter(r => r.decision === 'ไม่เปิดเผย').length}</td>
                        </tr>
                        <tr>
                            <td class="text-start fw-bold">คำอุทธรณ์เปิดเผยข้อมูล (10.2)</td>
                            <td>${DB_APPEALS_102.length}</td>
                            <td>${DB_APPEALS_102.filter(a => a.status !== 'แจ้งผลอุทธรณ์แล้ว').length}</td>
                            <td>${DB_APPEALS_102.filter(a => a.status === 'แจ้งผลอุทธรณ์แล้ว').length}</td>
                            <td>${DB_APPEALS_102.filter(a => a.boardDecision === 'เห็นชอบ').length}</td>
                            <td>${DB_APPEALS_102.filter(a => a.boardDecision === 'ยืนตามคำสั่ง').length}</td>
                        </tr>
                        <tr>
                            <td class="text-start fw-bold">คดีปกครองของสำนักงาน (10.3)</td>
                            <td>${DB_ADMIN_CASES_103.length}</td>
                            <td>${DB_ADMIN_CASES_103.filter(a => EcmisDomain.caseResult(a) === '—').length}</td>
                            <td>${DB_ADMIN_CASES_103.filter(a => EcmisDomain.caseResult(a) !== '—').length}</td>
                            <td>${DB_ADMIN_CASES_103.filter(a => EcmisDomain.caseResult(a) === 'ชนะคดี').length}</td>
                            <td>${DB_ADMIN_CASES_103.filter(a => EcmisDomain.caseResult(a) === 'แพ้คดี').length}</td>
                        </tr>
                    </tbody>
                </table>
            `;
        } else {
            container.innerHTML = `
                <div class="text-center mb-4">
                    <h5 class="fw-bold mb-1">รายงานสรุปสาระสำคัญผลคดีทางปกครองและคำชี้ขาด (เชิงคุณภาพ)</h5>
                    <div style="font-size:12px;" class="text-muted">ปีงบประมาณ 2569 · จัดทำ ณ วันที่ ${now.toLocaleDateString('th-TH')}</div>
                </div>
                <div class="p-3 border rounded bg-white mb-3" style="font-size: 13px;">
                    <div class="fw-bold text-primary mb-1">คดีหมายเลขดำ บ 29/2568 (ศาลปกครองเชียงใหม่)</div>
                    <div class="text-muted mb-2"><b>ผู้รับผิดชอบ:</b> ศิริพร · <b>เรื่อง:</b> ขอเพิกถอนคำสั่งทางปกครองชี้มูลวินัย</div>
                    <p class="mb-0 text-dark"><b>คำพิพากษาสรุป:</b> ศาลมีคำพิพากษายกฟ้องโจทก์ เนื่องจากพยานหลักฐานและมติคณะกรรมการ ป.ป.ท. ดำเนินการชี้มูลตามกรอบอำนาจหน้าที่ พ.ร.บ.มาตรการป้องกันปราบปรามการทุจริตอย่างชอบธรรม ไม่เป็นคำสั่งละเมิด คดีถึงที่สุดสำนักงาน ป.ป.ท. ชนะคดี</p>
                </div>
                <div class="p-3 border rounded bg-white" style="font-size: 13px;">
                    <div class="fw-bold text-primary mb-1">คำชี้ขาดอุทธรณ์ สขร. 037/2569 (พ.ร.บ. ข้อมูลข่าวสารฯ)</div>
                    <div class="text-muted mb-2"><b>เรื่อง:</b> ขอข้อมูลรายละเอียดใบประเมินราคาก่อสร้างทางหลวง</div>
                    <p class="mb-0 text-dark"><b>ข้อชี้ขาด:</b> บอร์ดมีมติเห็นควรเปิดเผยข้อมูล เนื่องจากเอกสารเป็นข้อมูลข่าวสารเกี่ยวกับการจัดซื้อจัดจ้างที่เป็นสาธารณะ ไม่เข้าข่ายข้อยกเว้นตามมาตรา 15 พ.ร.บ. ข้อมูลข่าวสารฯ ให้ ป.ป.ท. ดำเนินการเปิดเผยให้ผู้ร้องทราบ</p>
                </div>
            `;
        }

        logAuditEvent('REPORT_GENERATE', `จัดทำรายงานเชิง${format === 'quantitative' ? 'ปริมาณ' : 'คุณภาพ'} ประจำปี 2569`);
    }

    function exportTable(tableId, filename) {
        const table = document.getElementById(tableId);
        let csv = [];
        const rows = table.querySelectorAll('tr');
        
        for (let i = 0; i < rows.length; i++) {
            const row = [], cols = rows[i].querySelectorAll('td, th');
            for (let j = 0; j < cols.length - 1; j++) {
                row.push('"' + cols[j].innerText.trim().replace(/"/g, '""') + '"');
            }
            csv.push(row.join(','));
        }

        const csvString = '\uFEFF' + csv.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        logAuditEvent('DATA_EXPORT_EXCEL', `ส่งออกตารางสำนวนคดีในรูปแบบ Excel (.csv): ไฟล์ ${filename}`);
    }

    function triggerReportExportWord() {
        const format = document.getElementById('report-format-select').value;
        const html = document.getElementById('report-preview-container').innerHTML;
        if (!html) {
            alert("กรุณากด 'แสดงพรีวิว' เพื่อประมวลผลข้อมูลก่อนทำการดาวน์โหลด!");
            return;
        }

        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><title>Export Word</title><style>table{border-collapse:collapse;width:100%;}td,th{border:1px solid #000;padding:8px;}</style></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + html + footer;
        
        const fileBlob = new Blob(['\uFEFF' + sourceHTML], { type: 'application/msword' });
        const url = URL.createObjectURL(fileBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `E-CMIS_Report_${format}_${new Date().toISOString().split('T')[0]}.doc`;
        a.click();

        logAuditEvent('DATA_EXPORT_WORD', `ส่งออกรายงานผลเชิง${format === 'quantitative' ? 'ปริมาณ' : 'คุณภาพ'} ในรูปแบบ MS Word`);
    }

    function exportCaseDetailWord() {
        if (!currentSelectedCase) return;
        const c = currentSelectedCase;

        const html = `
            <h2>รายงานข้อมูลสำนวนคดี E-CMIS</h2>
            <p><b>เลขสำนวน ป.ป.ท.:</b> ${toThaiDigits(c.id)}</p>
            <p><b>ประเภทสำนวน:</b> ${c.type}</p>
            <p><b>คดีดำ / คดีแดง:</b> ${toThaiDigits(c.blackId)} / ${toThaiDigits(c.redId)}</p>
            <p><b>หน่วยงานอัยการ/ศาล:</b> ${c.office}</p>
            <p><b>ผู้ถูกกล่าวหา:</b> ${c.accused}</p>
            <p><b>สถานะคดีปัจจุบัน:</b> ${c.status}</p>
        `;

        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><title>Export Case Word</title></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + html + footer;

        const fileBlob = new Blob(['\uFEFF' + sourceHTML], { type: 'application/msword' });
        const url = URL.createObjectURL(fileBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Case_Report_${c.id.replace(/\//g, '-')}.doc`;
        a.click();

        logAuditEvent('DATA_EXPORT_WORD', `ส่งออกรายงานสรุปสำนวน ${c.id} ในรูปแบบ MS Word`);
    }

    // ==============================================
    // 12. UTILITIES & STORAGE SAVING
    // ==============================================
    function saveDatabase101() {
        localStorage.setItem('ecmis_cases101', JSON.stringify(DB_CASES_101));
    }
    function saveDatabase102() {
        localStorage.setItem('ecmis_appeals102', JSON.stringify(DB_APPEALS_102));
        localStorage.setItem('ecmis_requests102', JSON.stringify(DB_REQUESTS_102));
    }
    function saveDatabase103() {
        localStorage.setItem('ecmis_admin_cases103', JSON.stringify(DB_ADMIN_CASES_103));
    }

    function calculatePriority(item, moduleType) {
        const dueDateVal = item.dueDate || item.nextDate;
        if (!dueDateVal) return { level: 'Low', text: 'ปกติ', badgeClass: 'priority-low', rank: 1 };
        
        const now = new Date();
        const dueDate = new Date(dueDateVal);
        now.setHours(0,0,0,0);
        dueDate.setHours(0,0,0,0);
        
        const dateDiff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        
        // Check if assigned
        let isAssigned = false;
        if (moduleType === '10.1') {
            isAssigned = item.responsible && item.responsible !== '—' && item.responsible !== 'ระบุนิติกรผู้รับผิดชอบ' && item.responsible !== '';
        } else if (moduleType === '10.2') {
            isAssigned = item.division && item.division !== '—' && item.division !== '';
        } else if (moduleType === '10.3') {
            isAssigned = item.responsible && item.responsible !== '—' && item.responsible !== '';
        }
        
        // Check if high-severity category
        let isHighSeverity = false;
        if (moduleType === '10.1') {
            if (item.type && item.type.includes('ไม่ฟ้อง')) {
                isHighSeverity = true;
            }
        } else if (moduleType === '10.2') {
            if (typeof currentSelectedDisclosureType !== 'undefined' && currentSelectedDisclosureType === 'appeal') {
                isHighSeverity = true;
            } else if (item.id && item.id.includes('อธ')) {
                isHighSeverity = true;
            }
        } else if (moduleType === '10.3') {
            if (item.court && item.court.includes('สูงสุด')) {
                isHighSeverity = true;
            }
        }
        
        // 1. Critical Rule
        if (dateDiff < 3 || (item.status && (item.status.includes('เกินกำหนด') || item.status.includes('ล่าช้า')))) {
            return { level: 'Critical', text: 'วิกฤต', badgeClass: 'priority-critical', rank: 4 };
        }
        
        // 2. High Rule
        if (dateDiff >= 3 && dateDiff <= 7) {
            return { level: 'High', text: 'ด่วนมาก', badgeClass: 'priority-high', rank: 3 };
        }
        
        // Weighted upgrade to High:
        if (dateDiff >= 8 && dateDiff <= 14) {
            if (!isAssigned || isHighSeverity) {
                return { level: 'High', text: 'ด่วนมาก', badgeClass: 'priority-high', rank: 3 };
            }
            return { level: 'Medium', text: 'ด่วน', badgeClass: 'priority-medium', rank: 2 };
        }
        
        // 3. Medium Rule
        if (dateDiff >= 15 && dateDiff <= 30) {
            return { level: 'Medium', text: 'ด่วน', badgeClass: 'priority-medium', rank: 2 };
        }
        
        // Weighted upgrade to Medium:
        if (dateDiff > 30) {
            if (!isAssigned || isHighSeverity) {
                return { level: 'Medium', text: 'ด่วน', badgeClass: 'priority-medium', rank: 2 };
            }
            return { level: 'Low', text: 'ปกติ', badgeClass: 'priority-low', rank: 1 };
        }
        
        return { level: 'Low', text: 'ปกติ', badgeClass: 'priority-low', rank: 1 };
    }

    // ---------------------------------------------------------------
    // เลขไทยสำหรับเลขอ้างอิงทางการ (เลขสำนวน ป.ป.ท., คดีดำ/แดง, เลขคำร้อง/อุทธรณ์)
    //
    // กติกา: เก็บเป็นเลขอารบิกเสมอ — เพราะเลขสำนวนถูกใช้เป็น primary key
    // (`DB_CASES_101.find(c => c.id === caseId)`) และถูกส่งเข้า onclick
    // แปลงเป็นเลขไทย "ตอนแสดงผลเท่านั้น" และแปลงกลับที่ขาเข้า (ฟอร์ม + ช่องค้นหา)
    // มิฉะนั้น key จะมีสองรูปแบบปนกันและการค้นหา/เทียบจะพังเงียบ ๆ
    // ---------------------------------------------------------------
    // ตัวจริงอยู่ใน domain.js (มี unit test) — ที่นี่เป็นเพียงทางผ่าน
    function toThaiDigits(value) { return EcmisDomain.toThaiDigits(value); }
    function toArabicDigits(value) { return EcmisDomain.toArabicDigits(value); }

    // ---------- ตัวช่วยแสดงผลของคดีปกครอง (10.3) ----------

    // ตารางรายการแสดง "ใบล่าสุด" พร้อมป้ายนับ ถ้าสำนวนนี้มีคดีศาลหลายใบ
    function adminCaseNosHtml(a) {
        const latest = EcmisDomain.latestCourtCase(a);
        if (!latest) return `<span class="case-no case-no--empty">—</span>`;
        const extra = EcmisDomain.courtCaseCount(a) - 1;
        const badge = extra > 0
            ? ` <span class="status-badge status-yellow" style="font-size:9.5px; padding:1px 7px;">+${toThaiDigits(extra)}</span>`
            : '';
        return `
            <div>${caseNoHtml(latest.blackNo, 'black')}</div>
            <div style="margin-top:2px;">${caseNoHtml(latest.redNo, 'red')}${badge}</div>
        `;
    }

    function adminLevelBadge(level) {
        const cls = level === 'ชั้นต้น' ? 'status-navy' : 'status-orange';
        return `<span class="status-badge ${cls}">${level}</span>`;
    }

    function adminWorkStatusClass(workStatus) {
        const s = workStatus || '';
        if (s.includes('อัยการ')) return 'status-teal';
        if (s.includes('ที่สุด')) return 'status-green';
        if (s.includes('กลุ่มงาน')) return 'status-orange';
        return 'status-navy';
    }

    function adminResultBadge(result) {
        if (result === 'ชนะคดี') return `<span class="badge bg-success-subtle text-success border border-success px-2">ชนะคดี</span>`;
        if (result === 'แพ้คดี') return `<span class="badge bg-danger-subtle text-danger border border-danger px-2">แพ้คดี</span>`;
        if (result === 'จำหน่ายคดี') return `<span class="badge bg-secondary-subtle text-secondary border border-secondary px-2">จำหน่าย</span>`;
        return `<span class="text-muted">—</span>`;
    }

    // nextDate เดิมเก็บทั้งวันที่และข้อความ ('รอนัดแรก') ปนกัน ทำให้คำนวณวันไม่ได้
    // ตอนนี้แยกเป็น nextDate (ISO หรือ null) + nextDateNote (ข้อความ)
    function adminNextDateText(a) {
        if (a.nextDate) {
            const note = a.nextDateNote ? ` · ${a.nextDateNote}` : '';
            return `${formatDateThai(a.nextDate)}${note}`;
        }
        return a.nextDateNote || '—';
    }

    // เลขคดีดำ/แดง ระบายสีตามชื่อ; ค่าว่างหรือ '—' แสดงเป็นสีจาง ไม่ระบายสี
    function caseNoHtml(value, kind) {
        const v = (value === null || value === undefined) ? '' : String(value).trim();
        if (!v || v === '—' || v === '-') return `<span class="case-no case-no--empty">—</span>`;
        return `<span class="case-no case-no--${kind}">${toThaiDigits(v)}</span>`;
    }

    function formatDateThai(dateStr) {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        if (isNaN(date)) return dateStr;
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        let formatted = date.toLocaleDateString('th-TH', options);
        return formatted;
    }

    function setupFormDropdowns() {
        const responsibleSet = new Set();
        const officeSet = new Set();

        DB_CASES_101.forEach(c => {
            responsibleSet.add(c.responsible);
            officeSet.add(c.office);
        });

        const responsibleSelect = document.getElementById('filter-101-responsible');
        if (responsibleSelect) {
            responsibleSelect.innerHTML = '<option value="">ผู้รับผิดชอบ: ทั้งหมด</option>';
            responsibleSet.forEach(r => {
                const opt = document.createElement('option');
                opt.value = r;
                opt.innerText = r;
                responsibleSelect.appendChild(opt);
            });
        }

        const officeSelect = document.getElementById('filter-101-office');
        if (officeSelect) {
            officeSelect.innerHTML = '<option value="">อัยการ/ศาล: ทั้งหมด</option>';
            officeSet.forEach(o => {
                const opt = document.createElement('option');
                opt.value = o;
                opt.innerText = o;
                officeSelect.appendChild(opt);
            });
        }

        // 10.3.1 — สืบค้นมูลเหตุแห่งการฟ้องจากสารบบคดีเดิมของ ป.ป.ท.
        const sourceList = document.getElementById('source-case-list');
        if (sourceList) {
            sourceList.innerHTML = '';
            DB_CASES_101.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.label = `${c.accused} · ${c.type}`;
                sourceList.appendChild(opt);
            });
        }
    }

    function simulateFileDownload(filename) {
        logAuditEvent('FILE_DOWNLOAD', `ดาวน์โหลดเอกสารหลักฐานสำนวน: ไฟล์ ${filename} จากคดี ${currentSelectedCase ? currentSelectedCase.id : ''}`);
        alert(`จำลองการดาวน์โหลดไฟล์: ${filename}`);
    }

    function triggerFileUploadSimulator() {
        Swal.fire({
            title: 'ระบุชื่อเอกสารที่ต้องการอัพโหลด',
            input: 'text',
            inputValue: 'รายงานพยานเพิ่มเติม.pdf',
            showCancelButton: true,
            confirmButtonColor: '#1A2F6B',
            cancelButtonColor: '#6B7A99',
            confirmButtonText: 'อัปโหลด',
            cancelButtonText: 'ยกเลิก',
            inputValidator: (value) => {
                if (!value) {
                    return 'กรุณาระบุชื่อเอกสาร!';
                }
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const filename = result.value;
                const c = currentSelectedCase;
                if (c) {
                    const now = new Date();
                    const newDoc = {
                        name: filename,
                        size: '1.2 MB',
                        uploader: 'thanthita (นิติกร)',
                        date: `${now.getDate()} ${now.toLocaleDateString('th-TH', {month:'short'})} ${now.getFullYear().toString().substring(2)}`
                    };
                    c.docs.push(newDoc);
                    c.timeline.push({
                        date: now.toLocaleDateString('th-TH'),
                        desc: `อัปโหลดเอกสารใหม่แนบเข้าสำนวน: ${filename}`
                    });
                    saveDatabase101();
                    logAuditEvent('FILE_UPLOAD', `อัปโหลดเอกสารเพิ่มเติมเข้าสู่สำนวน ${c.id}: ไฟล์ ${filename}`);
                    alert("อัพโหลดไฟล์สำเร็จ!");
                    renderCaseDetail();
                }
            }
        });
    }

    function sendInternalNotification() {
        const notif1 = document.getElementById('notif-box-1').checked;
        const notif2 = document.getElementById('notif-box-2').checked;
        const notif3 = document.getElementById('notif-box-3').checked;
        const template = document.getElementById('notif-template').value;

        let targets = [];
        if (notif1) targets.push("กองบริหารคดี");
        if (notif2) targets.push("กองไต่สวน 3");
        if (notif3) targets.push("สำนักเลขาธิการ");

        if (targets.length === 0) {
            alert("กรุณาเลือกอย่างน้อย 1 หน่วยงานที่จะแจ้งผลคดี!");
            return;
        }

        logAuditEvent('INTERNAL_NOTIFICATION', `ส่งหนังสือแจ้งผลคดี ${currentSelectedCase.id} ให้หน่วยงาน [${targets.join(', ')}] โดยใช้ ${template}`);
        alert(`ส่งหนังสือแจ้งผลคดี ${currentSelectedCase.id} ไปยังหน่วยงานภายในเรียบร้อยแล้ว!\nระบบได้บันทึกหลักฐานการแจงส่งใน Audit Trail ของสำนวนเรียบร้อยแล้ว`);
    }

    // TOR 10.2.6 — แจ้งผลการพิจารณาคำร้อง/อุทธรณ์ให้หน่วยงานภายในทราบ
    function sendInternalNotification102() {
        if (!currentSelectedDisclosure) { alert("ไม่พบข้อมูลคำร้อง/อุทธรณ์ที่กำลังเปิดอยู่"); return; }

        const targets = [];
        if (document.getElementById('disc-notif-box-1')?.checked) targets.push(currentSelectedDisclosure.division || "หน่วยงานเจ้าของข้อมูล");
        if (document.getElementById('disc-notif-box-2')?.checked) targets.push("สำนักเลขาธิการ");
        if (document.getElementById('disc-notif-box-3')?.checked) targets.push("กองกฎหมาย");

        if (targets.length === 0) {
            alert("กรุณาเลือกอย่างน้อย 1 หน่วยงานที่จะแจ้งผล!");
            return;
        }

        const template = document.getElementById('disc-notif-template')?.value || 'หนังสือแจ้งผลการพิจารณา';
        logAuditEvent('INTERNAL_NOTIFICATION_102', `ส่งหนังสือแจ้งผลการพิจารณา ${currentSelectedDisclosure.id} ให้หน่วยงาน [${targets.join(', ')}] โดยใช้ ${template}`);
        alert(`ส่งหนังสือแจ้งผลการพิจารณา ${currentSelectedDisclosure.id} ไปยังหน่วยงานภายในเรียบร้อยแล้ว!\nระบบได้บันทึกหลักฐานการแจ้งส่งใน Audit Trail เรียบร้อยแล้ว`);
    }


    function todayISO() { return new Date().toISOString().split('T')[0]; }

    function refreshAdminViews() {
        renderAdminCasesTable();
        if (currentSelectedAdminCase) renderAdminCaseDetail();
        renderAdminStageStats();
    }

    /*
     * TOR 10.3.4 — บันทึกผลคำพิพากษา
     * เลขคดีแดง "เกิดจาก" คำพิพากษา จึงถูกออกที่นี่ ไม่ใช่ตอนลงทะเบียนรับเรื่อง
     * (เดิมฟังก์ชันนี้ตั้ง status = 'คดีถึงที่สุด' โดยไม่เคยเขียนเลขแดงเลย)
     */
    function openRecordResultModal103(caseId) {
        const a = DB_ADMIN_CASES_103.find(c => c.id === caseId);
        if (!a) { alert('ไม่พบข้อมูลคดีปกครอง'); return; }

        const pending = EcmisDomain.pendingCourtCases(a);
        if (!pending.length) {
            alert('ทุกชั้นศาลของสำนวนนี้มีคำพิพากษาแล้ว\nหากมีการอุทธรณ์ต่อ กรุณาเพิ่มคดีชั้นศาลใหม่ก่อน');
            return;
        }

        const options = pending.map((cc, i) =>
            `<option value="${EcmisDomain.courtCases(a).indexOf(cc)}">${cc.court} · คดีดำ ${toThaiDigits(cc.blackNo)}</option>`
        ).join('');
        const resultOptions = EcmisDomain.RESULTS.map(r => `<option value="${r}">${r}</option>`).join('');

        Swal.fire({
            title: 'บันทึกผลคำพิพากษา',
            html: `
                <div style="text-align:left; font-size:13px;">
                    <label style="font-size:11px; color:#6B7A99;">ชั้นศาลที่มีคำพิพากษา</label>
                    <select id="swal-cc" class="swal2-select" style="width:100%; margin:4px 0 12px;">${options}</select>

                    <label style="font-size:11px; color:#6B7A99;">หมายเลขคดีแดงที่ศาลออกให้</label>
                    <input id="swal-red" class="swal2-input" style="width:100%; margin:4px 0 12px;" placeholder="เช่น บ 88/68">

                    <label style="font-size:11px; color:#6B7A99;">ผลคดี</label>
                    <select id="swal-result" class="swal2-select" style="width:100%; margin:4px 0 12px;">${resultOptions}</select>

                    <label style="font-size:11px; color:#6B7A99;">แนบไฟล์คำพิพากษา (.docx .xlsx .pdf)</label>
                    <input id="swal-file" type="file" accept=".docx,.xlsx,.pdf" style="width:100%; margin:4px 0 0; font-size:12px;">
                </div>`,
            showCancelButton: true,
            confirmButtonColor: '#1A2F6B',
            cancelButtonColor: '#6B7A99',
            confirmButtonText: 'บันทึกผล',
            cancelButtonText: 'ยกเลิก',
            focusConfirm: false,
            preConfirm: () => {
                const idx = parseInt(document.getElementById('swal-cc').value, 10);
                const redNo = toArabicDigits(document.getElementById('swal-red').value).trim();
                const result = document.getElementById('swal-result').value;
                const file = document.getElementById('swal-file').files[0] || null;
                if (!redNo) { Swal.showValidationMessage('กรุณาระบุหมายเลขคดีแดง — เลขแดงคือสิ่งที่ยืนยันว่าศาลพิพากษาแล้ว'); return false; }
                return { idx, redNo, result, file };
            }
        }).then(r => {
            if (!r.isConfirmed || !r.value) return;
            const { idx, redNo, result, file } = r.value;
            const cc = EcmisDomain.courtCases(a)[idx];
            if (!cc) return;

            const ts = todayISO();
            cc.redNo = redNo;
            cc.redDate = ts;
            cc.result = result;

            if (file) attachAdminDoc(a, file, ts);

            a.history.push({ ts, event: 'result', desc: `${cc.court}พิพากษา — ออกเลขคดีแดง ${redNo} (${result})` });

            // ไม่มีคดีชั้นไหนค้างแล้ว ⇒ ถึงที่สุด
            if (EcmisDomain.pendingCourtCases(a).length === 0) {
                a.workStatus = 'คดีถึงที่สุด';
                a.nextDate = null;
                a.nextDateNote = '—';
                a.history.push({ ts, event: 'final', desc: 'คดีถึงที่สุด' });
            }

            saveDatabase103();
            logAuditEvent('ADMIN_CASE_RESULT', `บันทึกผลคำพิพากษา ${cc.blackNo} → ${redNo}: ${result}`);
            refreshAdminViews();
            Swal.fire({
                title: 'บันทึกผลคำพิพากษาแล้ว!',
                text: `ออกเลขคดีแดง ${toThaiDigits(redNo)}`,
                icon: 'success',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
            });
        });
    }

    /* TOR 10.3.3 — บันทึกสถานะงาน (พร้อมอัปโหลดหนังสือส่งอัยการ) */
    function openWorkStatusModal103(caseId) {
        const a = DB_ADMIN_CASES_103.find(c => c.id === caseId);
        if (!a) { alert('ไม่พบข้อมูลคดีปกครอง'); return; }

        const opts = EcmisDomain.WORK_STATUSES
            .map(s => `<option value="${s.key}" ${s.key === a.workStatus ? 'selected' : ''}>${s.key}</option>`)
            .join('');

        Swal.fire({
            title: 'บันทึกสถานะงาน',
            html: `
                <div style="text-align:left; font-size:13px;">
                    <label style="font-size:11px; color:#6B7A99;">สถานะการดำเนินงาน</label>
                    <select id="swal-ws" class="swal2-select" style="width:100%; margin:4px 0 12px;">${opts}</select>

                    <label style="font-size:11px; color:#6B7A99;">แนบเอกสารประกอบ เช่น หนังสือส่งสำนวนให้อัยการ</label>
                    <input id="swal-ws-file" type="file" accept=".docx,.xlsx,.pdf" style="width:100%; margin:4px 0 0; font-size:12px;">
                </div>`,
            showCancelButton: true,
            confirmButtonColor: '#1A2F6B',
            cancelButtonColor: '#6B7A99',
            confirmButtonText: 'บันทึก',
            cancelButtonText: 'ยกเลิก',
            focusConfirm: false,
            preConfirm: () => ({
                workStatus: document.getElementById('swal-ws').value,
                file: document.getElementById('swal-ws-file').files[0] || null
            })
        }).then(r => {
            if (!r.isConfirmed || !r.value) return;
            const { workStatus, file } = r.value;
            const meta = EcmisDomain.workStatusMeta(workStatus);
            const ts = todayISO();

            a.workStatus = workStatus;
            if (file) attachAdminDoc(a, file, ts);

            // ทุกการเปลี่ยนสถานะบันทึก timestamp — นี่คือแหล่งข้อมูลของสถิติ TOR 10.3.5
            a.history.push({ ts, event: meta ? meta.event : 'note', desc: workStatus });

            saveDatabase103();
            logAuditEvent('ADMIN_CASE_STATUS', `เปลี่ยนสถานะงานคดีปกครอง ${caseId} → ${workStatus}`);
            refreshAdminViews();
            Swal.fire({
                title: 'บันทึกสถานะงานสำเร็จ!',
                text: `เปลี่ยนสถานะงานเป็น: ${workStatus}`,
                icon: 'success',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
            });
        });
    }

    /*
     * ไฟล์แนบ: metadata ลง localStorage (ถาวร) แต่เนื้อไฟล์เก็บใน Map ระหว่าง session
     * ไม่ base64 ลง localStorage เพราะเพดาน ~5MB จะทำให้ saveDatabase*() throw และล้มทั้งระบบ
     */
    const ADMIN_FILE_BYTES = new Map();

    function attachAdminDoc(a, file, ts) {
        const sizeKb = file.size / 1024;
        const size = sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.round(sizeKb)} KB`;
        if (!Array.isArray(a.docs)) a.docs = [];
        a.docs.push({ name: file.name, size, uploader: 'ผู้ใช้งานปัจจุบัน', date: ts });
        ADMIN_FILE_BYTES.set(`${a.id}::${file.name}`, file);
    }

    function downloadAdminDoc(caseId, name) {
        const file = ADMIN_FILE_BYTES.get(`${caseId}::${name}`);
        if (!file) {
            alert(`ไฟล์ "${name}" เป็นข้อมูลตัวอย่างในระบบทดลอง จึงไม่มีเนื้อไฟล์ให้ดาวน์โหลด\n(ไฟล์ที่อัปโหลดในรอบนี้ดาวน์โหลดได้จนกว่าจะรีเฟรชหน้า)`);
            return;
        }
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function openRecordResultModal102(itemId, context) {
        Swal.fire({
            title: 'บันทึกผลการพิจารณาคำร้อง/คำอุทธรณ์',
            input: 'select',
            inputOptions: {
                'เปิดเผย': 'เปิดเผย',
                'ไม่เปิดเผย': 'ไม่เปิดเผย',
                'เปิดเผยบางส่วน': 'เปิดเผยบางส่วน',
                'ยืนตามสั่งเดิม': 'ยืนตามสั่งเดิม'
            },
            inputValue: 'เปิดเผย',
            showCancelButton: true,
            confirmButtonColor: '#1A2F6B',
            cancelButtonColor: '#6B7A99',
            confirmButtonText: 'บันทึก',
            cancelButtonText: 'ยกเลิก'
        }).then((sweetResult) => {
            if (sweetResult.isConfirmed && sweetResult.value) {
                const result = sweetResult.value;
                if (context === 'request') {
                    const r = DB_REQUESTS_102.find(req => req.id === itemId);
                    if (r) {
                        r.decision = result;
                        r.status = 'แจ้งผลแล้ว';
                        saveDatabase102();
                        logAuditEvent('DISCLOSURE_REQUEST_RESULT', `บันทึกผลพิจารณาคำร้อง ${itemId}: ${result}`);
                        alert("บันทึกผลสำเร็จ!");
                        renderDisclosureTable();
                    }
                } else {
                    const a = DB_APPEALS_102.find(ap => ap.id === itemId);
                    if (a) {
                        a.boardDecision = result;
                        a.status = 'แจ้งผลอุทธรณ์แล้ว';
                        saveDatabase102();
                        logAuditEvent('DISCLOSURE_APPEAL_RESULT', `บันทึกผลพิจารณาอุทธรณ์ ${itemId}: ${result}`);
                        alert("บันทึกผลสำเร็จ!");
                        renderDisclosureTable();
                    }
                }
            }
        });
    }

    function simulateDisclosureDetail(itemId) {
        let item = DB_REQUESTS_102.find(r => r.id === itemId);
        if (item) {
            currentSelectedDisclosure = item;
            currentSelectedDisclosureType = 'request';
        } else {
            item = DB_APPEALS_102.find(a => a.id === itemId);
            if (item) {
                currentSelectedDisclosure = item;
                currentSelectedDisclosureType = 'appeal';
            }
        }
        
        if (currentSelectedDisclosure) {
            logAuditEvent('DISCLOSURE_RECORD_VIEW', `เปิดดูรายละเอียดคำร้อง/คำอุทธรณ์ ${itemId}`);
            switchView('10.2-detail');
        } else {
            alert(`ไม่พบข้อมูลคำร้องหรืออุทธรณ์เลขที่ ${itemId}`);
        }
    }

    function renderDisclosureDetail() {
        if (!currentSelectedDisclosure) {
            console.warn('No disclosure request selected, redirecting to list view');
            switchView('10.2');
            return;
        }
        const d = currentSelectedDisclosure;
        const typeLabel = currentSelectedDisclosureType === 'request' ? 'คำร้องขอข้อมูลข่าวสาร' : 'คำอุทธรณ์คำสั่งไม่เปิดเผยข้อมูล';

        document.getElementById('detail-disc-no').innerText = toThaiDigits(d.id);
        document.getElementById('detail-disc-type').innerText = typeLabel;
        document.getElementById('detail-disc-status').innerText = d.status;

        const remElement = document.getElementById('detail-disc-remaining');
        if (d.dueDate) {
            const dateDiff = Math.ceil((new Date(d.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            if (dateDiff < 0) {
                remElement.innerText = "เกินกำหนดระยะเวลา";
                remElement.className = "status-badge status-red";
            } else {
                remElement.innerText = `คงเหลือ ${dateDiff} วัน`;
                remElement.className = dateDiff <= 7 ? "status-badge status-red" : "status-badge status-teal";
            }
        } else {
            remElement.innerText = "ไม่ระบุวันครบกำหนด";
            remElement.className = "status-badge status-navy";
        }

        const partiesText = currentSelectedDisclosureType === 'request' 
            ? `ผู้ร้องขอข้อมูล: ${d.name} · หน่วยงานเจ้าของข้อมูล: ${d.division}`
            : `ผู้อุทธรณ์: ${d.name} · อ้างอิงคำร้องเดิม: ${toThaiDigits(d.sourceNo)}`;
        document.getElementById('detail-disc-parties').innerText = partiesText;

        const stepperFill = document.getElementById('detail-disc-stepper-fill');
        let step = 1;
        if (d.status.includes('เสร็จ') || d.status.includes('แจ้งผล') || d.status.includes('เสร็จสิ้น')) {
            step = 5;
        } else if (d.status.includes('บอร์ด') || d.status.includes('พิจารณา')) {
            step = 4;
        } else if (d.status.includes('นิติกร') || d.status.includes('เสนอความเห็น')) {
            step = 3;
        } else if (d.status.includes('เสนอ') || d.status.includes('มอบหมาย')) {
            step = 2;
        } else {
            step = 1;
        }

        const progressPercentage = ((step - 1) / 4) * 100;
        stepperFill.style.width = `${progressPercentage}%`;

        for (let i = 1; i <= 5; i++) {
            const stepEl = document.getElementById(`disc-step-${i}`);
            if (stepEl) {
                if (i < step) {
                    stepEl.className = 'step-item completed';
                    stepEl.querySelector('.step-circle').innerHTML = '<i class="bi bi-check-lg"></i>';
                } else if (i === step) {
                    stepEl.className = 'step-item active';
                    stepEl.querySelector('.step-circle').innerText = i;
                } else {
                    stepEl.className = 'step-item';
                    stepEl.querySelector('.step-circle').innerText = i;
                }
            }
        }

        document.getElementById('meta-disc-type').innerText = typeLabel;
        document.getElementById('meta-disc-no').innerText = d.id;
        document.getElementById('meta-disc-name').innerText = d.name;
        document.getElementById('meta-disc-received').innerText = d.receivedDate ? formatDateThai(d.receivedDate) : '—';
        document.getElementById('meta-disc-due').innerText = d.dueDate ? formatDateThai(d.dueDate) : '—';
        document.getElementById('meta-disc-decision').innerText = d.decision || d.boardDecision || d.sgOpinion || '—';
        document.getElementById('meta-disc-division').innerText = d.division || 'กองกฎหมาย กลุ่มงานคดี';

        const subEl = document.getElementById('meta-disc-subcommittee');
        if (subEl) subEl.innerText = d.subCommittee || '—';

        // 10.2.4 — populate deadline alert card
        const alarmDays = document.getElementById('disc-alarm-days');
        const alarmDate = document.getElementById('disc-alarm-date');
        const alarmBar = document.getElementById('disc-alarm-bar');
        if (alarmDays && d.dueDate) {
            const diff = Math.ceil((new Date(d.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            alarmDays.innerText = diff < 0 ? `เกิน ${Math.abs(diff)}` : diff;
            alarmDays.className = diff <= 7 ? 'fw-bold text-danger mb-0 me-2' : 'fw-bold text-warning mb-0 me-2';
            if (alarmDate) alarmDate.innerText = formatDateThai(d.dueDate);
            if (alarmBar) {
                const pct = Math.max(5, Math.min(100, Math.round((diff / 30) * 100)));
                alarmBar.style.width = `${pct}%`;
                alarmBar.className = diff <= 7 ? 'progress-bar bg-danger' : 'progress-bar bg-warning';
            }
        }

        const docsList = document.getElementById('detail-disc-docs-list');
        docsList.innerHTML = '';
        const docsCount = d.docsCount || 2;
        const mockDocs = [
            { name: `หนังสือขอเปิดเผยข้อมูลข่าวสาร_${d.id.replace(/\//g, '-')}.pdf`, size: '1.4 MB', date: '2 วันที่แล้ว' },
            { name: `เอกสารบันทึกคำชี้แจงหน่วยงานต้นเรื่อง.pdf`, size: '850 KB', date: '1 วันที่แล้ว' },
            { name: `ร่างความเห็นทางกฎหมายประกอบคำพิจารณา.docx`, size: '320 KB', date: 'วันนี้' }
        ];

        for (let i = 0; i < Math.min(docsCount, mockDocs.length); i++) {
            const doc = mockDocs[i];
            const div = document.createElement('div');
            div.className = 'list-group-item d-flex justify-content-between align-items-center list-group-item-action py-2';
            div.innerHTML = `
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-file-earmark-pdf text-danger" style="font-size:18px;"></i>
                    <div>
                        <div class="text-value fw-bold" style="font-size: 12.5px;">${doc.name}</div>
                        <div class="text-sub">${doc.size} · ผู้อัปโหลด: นิติกรชำนาญการ · วันที่: ${doc.date}</div>
                    </div>
                </div>
                <div class="d-flex gap-1">
                    <button class="btn btn-xs btn-outline-navy py-0 px-2" onclick="alert('ดาวน์โหลดไฟล์สำเร็จ (จำลอง)')" style="font-size:11px;">เปิดดู</button>
                    <button class="btn btn-xs btn-action-view py-0 px-2" onclick="alert('เปิด Audit Trail Log ของไฟล์')" style="font-size:11px;"><i class="bi bi-shield-check"></i></button>
                </div>
            `;
            docsList.appendChild(div);
        }

        const timeline = document.getElementById('detail-disc-timeline');
        if (timeline) timeline.innerHTML = `
            <div class="mb-3 ps-3 border-left position-relative">
                <div class="rounded-circle bg-success position-absolute" style="width: 8px; height: 8px; left: -4px; top: 4px;"></div>
                <div class="fw-bold">รับเรื่องลงทะเบียนเสร็จสมบูรณ์</div>
                <div class="text-sub">เข้าระบบและเริ่มนับระยะเวลาดำเนินการนับจากวันที่รับเรื่อง</div>
            </div>
            <div class="mb-3 ps-3 border-left position-relative">
                <div class="rounded-circle bg-primary position-absolute" style="width: 8px; height: 8px; left: -4px; top: 4px;"></div>
                <div class="fw-bold">บันทึกความเห็นทางกฎหมายเบื้องต้น</div>
                <div class="text-sub">นิติกรเสนอข้อมูลประเมินความมั่นคงปลอดภัยสารสนเทศ</div>
            </div>
            <div class="ps-3 position-relative">
                <div class="rounded-circle bg-warning position-absolute" style="width: 8px; height: 8px; left: -4px; top: 4px;"></div>
                <div class="fw-bold">อยู่ระหว่างเตรียมเรื่องเสนอผู้บังคับบัญชา</div>
                <div class="text-sub">ตรวจสอบความถูกต้องของ PII Masking ครบถ้วน</div>
            </div>
        `;
    }

    function exportDisclosureDetailWord() {
        if (!currentSelectedDisclosure) return;
        const d = currentSelectedDisclosure;
        const title = `รายละเอียดคำร้อง ${toThaiDigits(d.id)}`;
        const bodyHtml = `
<h2 style="color:#1A2F6B;">${toThaiDigits(d.id)} · ${currentSelectedDisclosureType === 'request' ? 'คำร้องขอข้อมูลข่าวสาร' : 'คำอุทธรณ์'}</h2>
<table>
  <tr><th>ผู้ยื่น</th><td>${d.name || ''}</td><th>หน่วยงานเจ้าของเรื่อง</th><td>${d.division || ''}</td></tr>
  <tr><th>วันที่รับเรื่อง</th><td>${d.receivedDate ? formatDateThai(d.receivedDate) : ''}</td><th>ครบกำหนดพิจารณา</th><td>${d.dueDate ? formatDateThai(d.dueDate) : ''}</td></tr>
  <tr><th>ผลการพิจารณา</th><td>${d.decision || d.boardDecision || d.sgOpinion || '—'}</td><th>สถานะ</th><td>${d.status || ''}</td></tr>
</table>`;
        exportWordDocument(title, bodyHtml);
    }

    function exportDisclosureDetailPdf() {
        if (!currentSelectedDisclosure) return;
        alert("กำลังจัดพิมพ์รายงานรูปแบบ PDF...");
        window.print();
    }

    function selectAndShowAdminCaseDetail(itemId) {
        const a = DB_ADMIN_CASES_103.find(c => c.id === itemId);
        if (!a) { alert(`ไม่พบข้อมูลคดีปกครอง ${itemId}`); return; }
        currentSelectedAdminCase = a;
        logAuditEvent('ADMIN_CASE_VIEW', `เปิดแฟ้มข้อมูลคดีปกครอง ${itemId}`);
        switchView('10.3-detail');
    }

    function renderAdminCaseDetail() {
        if (!currentSelectedAdminCase) {
            console.warn('No admin case selected, redirecting to list view');
            switchView('10.3');
            return;
        }
        const a = currentSelectedAdminCase;

        const set = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
        const setHtml = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

        const latest = EcmisDomain.latestCourtCase(a);
        const extra = EcmisDomain.courtCaseCount(a) - 1;

        setHtml('detail-admin-nos', `
            ${caseNoHtml(latest ? latest.blackNo : null, 'black')}
            <span class="text-muted mx-2">→</span>
            ${caseNoHtml(latest ? latest.redNo : null, 'red')}
            ${extra > 0 ? `<span class="status-badge status-yellow ms-2">+${toThaiDigits(extra)} คดีชั้นอุทธรณ์</span>` : ''}
        `);

        setHtml('detail-admin-chips', `
            <span class="status-badge status-navy">${EcmisDomain.caseCourt(a)}</span>
            <span class="status-badge ${adminWorkStatusClass(a.workStatus)}">${a.workStatus}</span>
            ${adminResultBadge(EcmisDomain.caseResult(a))}
            <span class="status-badge ${EcmisDomain.isCaseFinal(a) ? 'status-green' : 'status-red'}">${EcmisDomain.isCaseFinal(a) ? 'คดีถึงที่สุด' : 'ยังไม่ถึงที่สุด'}</span>
        `);

        set('detail-admin-parties', `ผู้ฟ้องคดี: ${a.plaintiff} · ผู้ถูกฟ้องคดี: ${a.defendant} · ผู้ร้องสอด: ${a.interpleader || '—'}`);
        set('detail-admin-meta', `นิติกรผู้รับผิดชอบ: ${a.responsible} · ปีงบประมาณที่รับเรื่อง ${toThaiDigits(a.year)}`);

        // นัดหมายถัดไป
        const daysLeft = a.nextDate ? EcmisDomain.daysBetween(todayISO(), a.nextDate) : null;
        set('detail-admin-days', daysLeft === null ? '—' : (daysLeft < 0 ? '0' : String(daysLeft)));
        set('detail-admin-nextdate', adminNextDateText(a));

        // stepper 6 ขั้น
        const step = EcmisDomain.workStep(a);
        for (let i = 1; i <= 6; i++) {
            const el = document.getElementById(`admin-step-${i}`);
            if (!el) continue;
            const circle = el.querySelector('.step-circle');
            if (i < step) { el.className = 'step-item completed'; circle.innerHTML = '<i class="bi bi-check-lg"></i>'; }
            else if (i === step) { el.className = 'step-item active'; circle.innerText = i; }
            else { el.className = 'step-item'; circle.innerText = i; }
        }
        const fill = document.getElementById('admin-stepper-fill');
        if (fill) fill.style.width = `${((step - 1) / 5) * 100}%`;

        // ตารางคดีศาล (one-to-many)
        setHtml('detail-admin-courtcases', EcmisDomain.courtCases(a).map(cc => `
            <tr>
                <td>
                    <div class="fw-bold text-value">${cc.level === 'ชั้นต้น' ? 'ศาลปกครองชั้นต้น' : 'ศาลปกครองสูงสุด'}</div>
                    <div class="text-sub">${cc.court}</div>
                </td>
                <td>${caseNoHtml(cc.blackNo, 'black')}</td>
                <td>${caseNoHtml(cc.redNo, 'red')}</td>
                <td>${EcmisDomain.isPending(cc) ? '<span class="status-badge status-yellow">ระหว่างพิจารณา</span>' : adminResultBadge(cc.result)}</td>
                <td class="text-value fw-normal">${cc.redDate ? formatDateThai(cc.redDate) : '—'}</td>
            </tr>
        `).join(''));

        // ข้อมูลหมายเรียก
        set('detail-admin-court', EcmisDomain.caseCourt(a));
        set('detail-admin-level', EcmisDomain.caseLevel(a));
        set('detail-admin-plaintiff', a.plaintiff);
        set('detail-admin-defendant', a.defendant);
        set('detail-admin-interpleader', a.interpleader || '—');
        set('detail-admin-received', formatDateThai(a.receivedDate));
        set('detail-admin-year', toThaiDigits(a.year));
        set('detail-admin-responsible', a.responsible);
        set('detail-admin-reason', a.reason || '—');

        // มูลเหตุคดีเดิม (Key Mapping กลับไปสำนวน ป.ป.ท.)
        setHtml('detail-admin-source', `<span class="text-decoration-underline" style="color:var(--primary-light); cursor:pointer;" onclick="searchAndShowCaseFromSource('${a.sourceCase}')">${toThaiDigits(a.sourceCase)}</span>`);

        // เอกสาร
        const docs = Array.isArray(a.docs) ? a.docs : [];
        setHtml('detail-admin-docs', docs.length === 0
            ? '<div class="text-center py-3 text-muted">ยังไม่มีเอกสารแนบ</div>'
            : docs.map(d => {
                const ext = d.name.split('.').pop().toUpperCase();
                const color = ext === 'PDF' ? 'bg-danger' : 'bg-primary';
                return `
                    <div class="list-group-item d-flex justify-content-between align-items-center border-0 border-bottom px-0 py-2">
                        <div class="d-flex align-items-center gap-3">
                            <div class="badge ${color} d-flex align-items-center justify-content-center" style="width:36px; height:36px; font-size:10px;">${ext}</div>
                            <div>
                                <div class="fw-bold" style="font-size:13px;">${d.name}</div>
                                <div class="text-sub">${d.size} · ${d.uploader} · ${formatDateThai(d.date)}</div>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-navy py-1 px-3" onclick="downloadAdminDoc('${a.id}', ${JSON.stringify(d.name).replace(/"/g, '&quot;')})">ดาวน์โหลด</button>
                    </div>`;
            }).join(''));

        // ประวัติการดำเนินการ + ส่วนต่างวัน (ที่มาของสถิติ 10.3.5)
        const hist = Array.isArray(a.history) ? a.history : [];
        setHtml('detail-admin-history', hist.map((h, i) => {
            const prev = i > 0 ? hist[i - 1] : null;
            const delta = prev ? EcmisDomain.daysBetween(prev.ts, h.ts) : null;
            const isLast = i === hist.length - 1;
            return `
                <div class="audit-item ${isLast ? 'active' : ''}">
                    <div class="text-sub font-monospace">
                        ${formatDateThai(h.ts)}
                        ${delta !== null ? `<span class="badge bg-light text-secondary border ms-2" style="font-size:9.5px;">+${delta} วัน</span>` : ''}
                    </div>
                    <div class="fw-bold mt-1 text-dark" style="font-size:12px;">${h.desc}</div>
                </div>`;
        }).join(''));

        // ปุ่มการทำงานผูกกับสำนวนที่เปิดอยู่
        const btnStatus = document.getElementById('btn-admin-status');
        const btnResult = document.getElementById('btn-admin-result');
        if (btnStatus) btnStatus.onclick = () => openWorkStatusModal103(a.id);
        if (btnResult) btnResult.onclick = () => openRecordResultModal103(a.id);
    }

    // ==============================================
    // 10.3 ADMINISTRATIVE LITIGATION RENDERING
    // ==============================================
    function renderAdminCasesTable() {
        renderKPIs103();

        const body = document.getElementById('admin-cases-table-body');
        if (!body) return;
        body.innerHTML = '';

        let filtered = DB_ADMIN_CASES_103;

        const search = toArabicDigits(document.getElementById('filter-103-search').value).toLowerCase().trim();
        const court = document.getElementById('filter-103-court').value;
        const type = document.getElementById('filter-103-type').value;
        const result = document.getElementById('filter-103-result').value;

        // ค้นหา/กรอง ต้องมองทุกใบใน courtCases[] ไม่ใช่แค่ใบล่าสุด
        filtered = filtered.filter(a =>
            EcmisDomain.matchesSearch(a, search) &&
            EcmisDomain.matchesCourt(a, court) &&
            EcmisDomain.matchesLevel(a, type) &&
            EcmisDomain.matchesResult(a, result)
        );

        if (filtered.length === 0) {
            body.innerHTML = `<tr><td colspan="10" class="text-center text-muted py-4">ไม่พบข้อมูลคดีปกครองตามค้นหา</td></tr>`;
            return;
        }

        filtered.forEach(a => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${adminCaseNosHtml(a)}</td>
                <td>
                    <div class="text-value fw-normal">${EcmisDomain.caseCourt(a)}</div>
                </td>
                <td>${adminLevelBadge(EcmisDomain.caseLevel(a))}</td>
                <td>
                    <div class="text-value fw-normal">${a.plaintiff}</div>
                    <div class="text-sub">${a.defendant}</div>
                </td>
                <td>
                    <div class="text-value fw-bold text-decoration-underline" style="color:var(--primary-light); cursor:pointer;" onclick="searchAndShowCaseFromSource('${a.sourceCase}')">${toThaiDigits(a.sourceCase)}</div>
                </td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="avatar-sm">${a.responsible.charAt(0)}</div>
                        <span class="text-value fw-normal">${a.responsible}</span>
                    </div>
                </td>
                <td><div class="status-badge ${adminWorkStatusClass(a.workStatus)}">${a.workStatus}</div></td>
                <td>${adminResultBadge(EcmisDomain.caseResult(a))}</td>
                <td><div class="text-value fw-normal">${adminNextDateText(a)}</div></td>
                <td>
                    <div class="d-flex gap-1">
                        <button class="btn btn-action-view" onclick="selectAndShowAdminCaseDetail('${a.id}')">ดู</button>
                        <button class="btn btn-action-save" onclick="openRecordResultModal103('${a.id}')">ผลศาล</button>
                    </div>
                </td>
            `;
            body.appendChild(tr);
        });
    }

    function renderKPIs103() {
        const container = document.getElementById('kpi-cards-103');
        if (!container) return;

        const total = DB_ADMIN_CASES_103.length;
        const pendingCount = DB_ADMIN_CASES_103.filter(a => EcmisDomain.caseResult(a) === '—').length;
        const winCount = DB_ADMIN_CASES_103.filter(a => EcmisDomain.caseResult(a) === 'ชนะคดี').length;
        const lossCount = DB_ADMIN_CASES_103.filter(a => EcmisDomain.caseResult(a) === 'แพ้คดี').length;

        container.innerHTML = `
            <div class="col-6 col-md-3">
                <div class="sc-header-card sc-navy">
                    <div class="card-banner">คดีปกครองทั้งหมด</div>
                    <div class="card-num">${total}</div>
                    <div class="card-sub">ปีงบประมาณ 2569</div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="sc-header-card sc-orange">
                    <div class="card-banner">อยู่ระหว่างศาลพิจารณา</div>
                    <div class="card-num">${pendingCount}</div>
                    <div class="card-sub">ชั้นต้นและสูงสุด</div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="sc-header-card sc-teal">
                    <div class="card-banner">ชนะคดี (สถิติรวม)</div>
                    <div class="card-num">${winCount}</div>
                    <div class="card-sub">สถิติสะสม ป.ป.ท.</div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="sc-header-card sc-red">
                    <div class="card-banner">แพ้คดี (สถิติรวม)</div>
                    <div class="card-num">${lossCount}</div>
                    <div class="card-sub">ใช้ยื่นอุทธรณ์ต่อศาลสูง</div>
                </div>
            </div>
        `;
    }

    function searchAndShowCaseFromSource(sourceId) {
        const normalized = sourceId.replace(/\s/g, '').toLowerCase();
        const found = DB_CASES_101.find(c => c.id.replace(/\s/g, '').toLowerCase() === normalized);
        if (found) {
            selectAndShowCaseDetail(found.id);
        } else {
            alert(`ไม่พบเลขสำนวนต้นเรื่อง ${sourceId} ในฐานระบบสารบบปัจจุบัน`);
        }
    }

    function applyFilters101() { renderCases101Table(); }
    // Set a filter <select> value and sync its custom-select UI (shared by 10.1/10.2/10.3).
    // Safe on missing elements so clearing a filter set never throws.
    function setFilterSelectValue(id, value) {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = value;
        // Notify the custom-select wrapper to refresh its trigger text/active item
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    // Clear a plain text/search input by id, safely.
    function clearInputValue(id) {
        const el = document.getElementById(id);
        if (el) el.value = '';
    }
    function clearFilters101() {
        clearInputValue('filter-101-search');
        setFilterSelectValue('filter-101-type', '');
        setFilterSelectValue('filter-101-step', '');
        setFilterSelectValue('filter-101-office', '');
        setFilterSelectValue('filter-101-responsible', '');
        resetRangePicker('filter-101-date-range');
        renderCases101Table();
    }
    function filterUrgent101() {
        clearInputValue('filter-101-search');
        setFilterSelectValue('filter-101-type', '');
        setFilterSelectValue('filter-101-office', '');
        setFilterSelectValue('filter-101-responsible', '');
        resetRangePicker('filter-101-date-range');
        setFilterSelectValue('filter-101-step', 'อัยการ');
        renderCases101Table();
    }

    function applyFilters102() { renderDisclosureTable(); }
    function clearFilters102() {
        clearInputValue('filter-102-search');
        setFilterSelectValue('filter-102-status', '');
        setFilterSelectValue('filter-102-result', '');
        resetRangePicker('filter-102-date-range');
        renderDisclosureTable();
    }

    // Expose helper globally
    window.applyFilters101 = applyFilters101;
    window.clearFilters101 = clearFilters101;
    window.applyFilters102 = applyFilters102;
    window.clearFilters102 = clearFilters102;

    function applyFilters103() { renderAdminCasesTable(); }
    function clearFilters103() {
        clearInputValue('filter-103-search');
        setFilterSelectValue('filter-103-court', '');
        setFilterSelectValue('filter-103-type', '');
        setFilterSelectValue('filter-103-result', '');
        resetRangePicker('filter-103-date-range');
        renderAdminCasesTable();
    }
    window.applyFilters103 = applyFilters103;
    window.clearFilters103 = clearFilters103;








    // ================================================================
    // EXPORT ENGINE — รองรับ Excel, CSV, JSON, Word (docx), PDF (print)
    // ตาม TOR กิจกรรมที่ 10 ข้อ 2.1.6.4 และมาตรฐาน Dashboard Report
    // ================================================================

    function getDataSource(module) {
        if (module === '101') return JSON.parse(localStorage.getItem('ecmis_cases101')) || [];
        if (module === '102') {
            const activeTab = activeDisclosureSubTab || 'requests';
            if (activeTab === 'appeals') return JSON.parse(localStorage.getItem('ecmis_appeals102')) || [];
            return JSON.parse(localStorage.getItem('ecmis_requests102')) || [];
        }
        if (module === '103') return JSON.parse(localStorage.getItem('ecmis_admin_cases103')) || [];
        return [];
    }

    function getDataColumns(module) {
        if (module === '101') {
            return [
                { key: 'id',          label: 'เลขสำนวน ป.ป.ท.', thai: true },
                { key: 'type',        label: 'ประเภทสำนวน' },
                { key: 'accuser',     label: 'ผู้กล่าวหา' },
                { key: 'accused',     label: 'ผู้ถูกกล่าวหา' },
                { key: 'blackId',     label: 'คดีดำ', thai: true },
                { key: 'redId',       label: 'คดีแดง', thai: true },
                { key: 'office',      label: 'สำนักงานอัยการ' },
                { key: 'court',       label: 'ศาล' },
                { key: 'responsible', label: 'ผู้รับผิดชอบ' },
                { key: 'status',      label: 'สถานะ' },
                { key: 'dueDate',     label: 'ครบกำหนด' }
            ];
        }
        if (module === '102') {
            const activeTab = activeDisclosureSubTab || 'requests';
            if (activeTab === 'appeals') {
                return [
                    { key: 'id',             label: 'เลขอุทธรณ์', thai: true },
                    { key: 'type',           label: 'ประเภท' },
                    { key: 'name',           label: 'ผู้อุทธรณ์' },
                    { key: 'sourceNo',       label: 'เลขคำร้องต้นเรื่อง', thai: true },
                    { key: 'receivedDate',   label: 'วันที่รับเรื่อง' },
                    { key: 'dueDate',        label: 'ครบกำหนด' },
                    { key: 'sgOpinion',      label: 'ความเห็นเลขาธิการ' },
                    { key: 'boardDecision',  label: 'มติบอร์ด' },
                    { key: 'status',         label: 'สถานะ' }
                ];
            }
            return [
                { key: 'id',           label: 'เลขคำร้อง', thai: true },
                { key: 'type',         label: 'ประเภท' },
                { key: 'name',         label: 'ผู้ร้อง' },
                { key: 'division',     label: 'หน่วยงานต้นเรื่อง' },
                { key: 'receivedDate', label: 'วันที่รับเรื่อง' },
                { key: 'dueDate',      label: 'ครบกำหนด' },
                { key: 'decision',     label: 'ผลการพิจารณา' },
                { key: 'status',       label: 'สถานะ' }
            ];
        }
        if (module === '103') {
            // เลขคดีดำ/แดง อยู่ใน courtCases[] แล้ว จึงต้องใช้คอลัมน์แบบคำนวณ
            // (เดิมอ้าง key 'blackId' และ 'workStatus' ที่ไม่มีอยู่จริง → ส่งออกเป็นค่าว่าง)
            const all = c => EcmisDomain.courtCases(c);
            return [
                { label: 'คดีดำ (ทุกชั้นศาล)', thai: true, get: c => all(c).map(cc => cc.blackNo).filter(Boolean).join(' / ') },
                { label: 'คดีแดง (ทุกชั้นศาล)', thai: true, get: c => all(c).map(cc => cc.redNo).filter(Boolean).join(' / ') || '—' },
                { label: 'จำนวนคดีในศาล', get: c => EcmisDomain.courtCaseCount(c) },
                { label: 'ศาลปกครอง (ล่าสุด)', get: c => EcmisDomain.caseCourt(c) },
                { label: 'ประเภทคดี (ล่าสุด)', get: c => EcmisDomain.caseLevel(c) },
                { key: 'plaintiff',    label: 'ผู้ฟ้อง' },
                { key: 'defendant',    label: 'ผู้ถูกฟ้อง' },
                { key: 'sourceCase',   label: 'มูลเหตุคดี (สำนวน ป.ป.ท.)', thai: true },
                { key: 'responsible',  label: 'นิติกรผู้รับผิดชอบ' },
                { key: 'workStatus',   label: 'สถานะการดำเนินงาน' },
                { label: 'ผลคดี', get: c => EcmisDomain.caseResult(c) },
                { label: 'คดีถึงที่สุด', get: c => EcmisDomain.isCaseFinal(c) ? 'ใช่' : 'ยัง' },
                { label: 'นัดหมายถัดไป', get: c => adminNextDateText(c) }
            ];
        }
        return [];
    }

    // ค่าที่จะเขียนลงเซลล์ของทุก export (Excel/Word/PDF)
    // คอลัมน์ที่ทำเครื่องหมาย thai:true คือเลขอ้างอิงทางการ → แสดงเป็นเลขไทย
    // คอลัมน์ตัวเลขเชิงสถิติไม่มีเครื่องหมายนี้ จึงยังคำนวณ/เรียงใน Excel ได้
    function exportCellValue(row, col) {
        const raw = col.get ? col.get(row) : row[col.key];
        const v = (raw !== undefined && raw !== null) ? raw : '';
        return col.thai ? toThaiDigits(v) : v;
    }

    function getModuleTitle(module) {
        if (module === '101') return 'รายการสำนวนคดีชั้นอัยการและชั้นศาล';
        if (module === '102') {
            const activeTab = activeDisclosureSubTab || 'requests';
            return activeTab === 'appeals' ? 'รายการคำอุทธรณ์คำสั่งไม่เปิดเผยข้อมูล' : 'รายการคำร้องขอเปิดเผยข้อมูลข่าวสาร';
        }
        if (module === '103') return 'รายการควบคุมคดีปกครอง';
        return 'รายงาน';
    }

    function triggerDownload(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }



    function exportExcel(module) {
        // Generates a clean HTML table file that Excel can open natively (XLS-HTML trick)
        // Fully functional without any external library
        const data = getDataSource(module);
        const cols = getDataColumns(module);
        const title = getModuleTitle(module);
        const timestamp = new Date().toLocaleString('th-TH');

        let tableRows = data.map(row => {
            const cells = cols.map(c => {
                const v = exportCellValue(row, c);
                return `<td style="border:1px solid #ccc; padding:6px; font-size:11pt;">${v}</td>`;
            }).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        const headerRow = cols.map(c =>
            `<th style="border:1px solid #999; padding:6px; background:#0D1B3E; color:#fff; font-size:11pt;">${c.label}</th>`
        ).join('');

        const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8">
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>${title}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>td, th { font-family: 'Sarabun', sans-serif; }</style>
</head><body>
<h2 style="font-family:Sarabun,sans-serif;">${title}</h2>
<p style="font-family:Sarabun,sans-serif; color:#666; font-size:10pt;">ส่งออกเมื่อ: ${timestamp} · ระบบ E-CMIS ป.ป.ท.</p>
<table border="0" cellspacing="0">
<thead><tr>${headerRow}</tr></thead>
<tbody>${tableRows}</tbody>
</table></body></html>`;
        triggerDownload(html, `${title}.xls`, 'application/vnd.ms-excel;charset=utf-8');
    }

    function exportWordDocument(title, bodyHtml) {
        // Generates a Word-compatible .doc file using HTML-to-Word technique
        const timestamp = new Date().toLocaleString('th-TH');
        const doc = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='UTF-8'>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
  body { font-family: 'Sarabun', sans-serif; font-size: 14pt; margin: 2cm; }
  h1 { color: #0D1B3E; font-size: 18pt; border-bottom: 2px solid #D5B45B; padding-bottom: 6pt; }
  h2 { color: #1A2F6B; font-size: 14pt; }
  table { width: 100%; border-collapse: collapse; font-size: 12pt; }
  th { background: #0D1B3E; color: #fff; padding: 6pt; text-align: left; }
  td { border: 1pt solid #ccc; padding: 5pt; }
  .meta { color: #666; font-size: 10pt; margin-bottom: 18pt; }
  .footer { margin-top: 24pt; color: #888; font-size: 10pt; border-top: 1pt solid #ccc; padding-top: 6pt; }
</style></head>
<body>
<h1>${title}</h1>
<p class="meta">สร้างเมื่อ: ${timestamp} · ระบบ E-CMIS สำนักงาน ป.ป.ท.</p>
${bodyHtml}
<p class="footer">เอกสารนี้สร้างโดยระบบ E-CMIS โดยอัตโนมัติ · ห้ามนำไปใช้อ้างอิงโดยไม่ได้รับอนุมัติจากผู้มีอำนาจ</p>
</body></html>`;
        triggerDownload(doc, `${title}.doc`, 'application/msword;charset=utf-8');
    }

    function exportWord(module) {
        const data = getDataSource(module);
        const cols = getDataColumns(module);
        const title = getModuleTitle(module);

        const headerRow = cols.map(c => `<th>${c.label}</th>`).join('');
        const tableRows = data.map(row => {
            const cells = cols.map(c => `<td>${exportCellValue(row, c)}</td>`).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        const bodyHtml = `
<table>
  <thead><tr>${headerRow}</tr></thead>
  <tbody>${tableRows}</tbody>
</table>`;
        exportWordDocument(title, bodyHtml);
    }

    function exportPdf(module) {
        const data = getDataSource(module);
        const cols = getDataColumns(module);
        const title = getModuleTitle(module);
        const timestamp = new Date().toLocaleString('th-TH');

        const headerRow = cols.map(c =>
            `<th style="background:#0D1B3E;color:#fff;padding:6pt;text-align:left;font-size:10pt;">${c.label}</th>`
        ).join('');
        const tableRows = data.map(row => {
            const cells = cols.map(c =>
                `<td style="border:1pt solid #ddd;padding:5pt;font-size:10pt;">${exportCellValue(row, c)}</td>`
            ).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        const printHtml = `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
  body { font-family: 'Sarabun', sans-serif; margin: 1.5cm; }
  h1 { color: #0D1B3E; font-size: 16pt; margin-bottom: 4pt; }
  .meta { color: #888; font-size: 9pt; margin-bottom: 12pt; }
  table { width: 100%; border-collapse: collapse; }
  @media print { body { margin: 0; } }
</style></head>
<body>
<h1>${title}</h1>
<p class="meta">สร้างเมื่อ: ${timestamp} · ระบบ E-CMIS สำนักงาน ป.ป.ท.</p>
<table>
  <thead><tr>${headerRow}</tr></thead>
  <tbody>${tableRows}</tbody>
</table>
<script>window.onload = function() { window.print(); setTimeout(() => window.close(), 800); }<\/script>
</body></html>`;

        const win = window.open('', '_blank');
        if (win) {
            win.document.write(printHtml);
            win.document.close();
        }
    }

    function exportData(module, format) {
        logAuditEvent('DATA_EXPORT', `Export ${format.toUpperCase()} จากโมดูล ${module}: ${getModuleTitle(module)}`);
        switch (format) {
            case 'excel': exportExcel(module); break;
            case 'word':  exportWord(module);  break;
            case 'pdf':   exportPdf(module);   break;
            default:
                Swal.fire({ icon: 'error', title: 'ไม่รองรับรูปแบบนี้', text: `รูปแบบ "${format}" ยังไม่ได้รับการรองรับ` });
        }
    }

    function exportCaseDetailPdf() {
        const c = currentSelectedCase;
        if (!c) return;
        const title = `สำนวนคดี ${toThaiDigits(c.id)}`;
        const bodyHtml = `
<h2 style="color:#1A2F6B;">${toThaiDigits(c.id)} · ${c.type}</h2>
<table>
  <tr><th>ผู้กล่าวหา</th><td>${c.accuser || ''}</td><th>ผู้ถูกกล่าวหา</th><td>${c.accused || ''}</td></tr>
  <tr><th>คดีดำ</th><td>${toThaiDigits(c.blackId)}</td><th>คดีแดง</th><td>${toThaiDigits(c.redId)}</td></tr>
  <tr><th>สำนักงานอัยการ</th><td>${c.office || ''}</td><th>ศาล</th><td>${c.court || ''}</td></tr>
  <tr><th>ผู้รับผิดชอบ</th><td>${c.responsible || ''}</td><th>สถานะ</th><td>${c.status || ''}</td></tr>
  <tr><th>อายุความสิ้นสุด</th><td colspan="3">${c.dueDate || ''}</td></tr>
</table>`;
        const printHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{font-family:'Sarabun',sans-serif;margin:2cm;} h1{color:#0D1B3E;} table{width:100%;border-collapse:collapse;} th,td{border:1pt solid #ccc;padding:5pt;font-size:11pt;} th{background:#EEF3FB;color:#0D1B3E;}</style>
</head><body><h1>${title}</h1>${bodyHtml}
<script>window.onload = function() { window.print(); setTimeout(() => window.close(), 800); }<\/script>
</body></html>`;
        const win = window.open('', '_blank');
        if (win) { win.document.write(printHtml); win.document.close(); }
    }

    function exportCaseDetailWord() {
        const c = currentSelectedCase;
        if (!c) return;
        const title = `สำนวนคดี ${toThaiDigits(c.id)}`;
        const bodyHtml = `
<h2 style="color:#1A2F6B;">${toThaiDigits(c.id)} · ${c.type}</h2>
<table>
  <tr><th>ผู้กล่าวหา</th><td>${c.accuser || ''}</td><th>ผู้ถูกกล่าวหา</th><td>${c.accused || ''}</td></tr>
  <tr><th>คดีดำ</th><td>${toThaiDigits(c.blackId)}</td><th>คดีแดง</th><td>${toThaiDigits(c.redId)}</td></tr>
  <tr><th>สำนักงานอัยการ</th><td>${c.office || ''}</td><th>ศาล</th><td>${c.court || ''}</td></tr>
  <tr><th>ผู้รับผิดชอบ</th><td>${c.responsible || ''}</td><th>สถานะ</th><td>${c.status || ''}</td></tr>
  <tr><th>อายุความสิ้นสุด</th><td colspan="3">${c.dueDate || ''}</td></tr>
</table>`;
        exportWordDocument(title, bodyHtml);
    }

    // Custom Flatpickr Translation and Setup
    const flatpickrThai = {
        firstDayOfWeek: 1, // Start on Monday (จ)
        weekdays: {
            shorthand: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
            longhand: ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"]
        },
        months: {
            shorthand: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
            longhand: ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]
        },
        rangeSeparator: " – "
    };

    function formatGregorianDate(date) {
        if (!date) return '';
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    }

    function initFlatpickrDatepickers() {
        // 1. Initialize Range Pickers for Search Filters
        const rangePickers = [
            { id: 'filter-101-date-range', callback: applyFilters101 },
            { id: 'filter-102-date-range', callback: applyFilters102 },
            { id: 'filter-103-date-range', callback: applyFilters103 }
        ];

        rangePickers.forEach(item => {
            const el = document.getElementById(item.id);
            if (!el) return;

            // Blazor may re-render (replace) this node after prerender / on view switch,
            // orphaning the previous flatpickr binding. Destroy any stale instance on the
            // current node before (re)binding so clicks always open a live calendar.
            if (el._flatpickr) el._flatpickr.destroy();

            // Set defaults initially
            el.value = "";
            el.placeholder = "เลือกช่วงวันที่รับเรื่อง";
            el.dataset.startDate = "";
            el.dataset.endDate = "";

            flatpickr(el, {
                mode: "range",
                locale: flatpickrThai,
                dateFormat: "Y-m-d",
                onReady: function(selectedDates, dateStr, instance) {
                    el.value = "";
                },
                onChange: function(selectedDates, dateStr, instance) {
                    if (selectedDates.length === 2) {
                        const start = selectedDates[0];
                        const end = selectedDates[1];
                        const toISODate = (d) => {
                            const year = d.getFullYear();
                            const month = String(d.getMonth() + 1).padStart(2, '0');
                            const day = String(d.getDate()).padStart(2, '0');
                            return `${year}-${month}-${day}`;
                        };
                        el.dataset.startDate = toISODate(start);
                        el.dataset.endDate = toISODate(end);
                        el.value = `${formatGregorianDate(start)} - ${formatGregorianDate(end)}`;
                    } else if (selectedDates.length === 1) {
                        el.value = `${formatGregorianDate(selectedDates[0])} - ...`;
                    }
                },
                onClose: function(selectedDates, dateStr, instance) {
                    if (selectedDates.length === 2) {
                        if (item.callback) item.callback();
                    }
                }
            });
        });

        // 2. Initialize Single Pickers for Modals (Figma-inspired, uses altInput to display formatted Thai date while keeping Y-m-d value)
        const modalInputs = ['form-101-due', 'form-102-received', 'form-103-date'];
        modalInputs.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            // altInput creates a sibling node; destroy stale instance before re-binding
            if (el._flatpickr) el._flatpickr.destroy();

            flatpickr(el, {
                locale: flatpickrThai,
                dateFormat: "Y-m-d",
                altInput: true,
                altFormat: "d/m/Y",
                allowInput: false
            });
        });
    }
    window.initFlatpickrDatepickers = initFlatpickrDatepickers;

    function resetRangePicker(id) {
        const el = document.getElementById(id);
        if (el) {
            el.value = "";
            el.dataset.startDate = "";
            el.dataset.endDate = "";
            if (el._flatpickr) {
                el._flatpickr.clear();
            }
        }
    }

    function initCustomSelects() {
        const selects = document.querySelectorAll('select.form-select');
        selects.forEach(select => {
            const nextSib = select.nextElementSibling;
            const hasWrapper = nextSib && nextSib.classList && nextSib.classList.contains('custom-select-wrapper');
            
            if (hasWrapper) {
                select.classList.add('custom-select-hidden');
                select.style.display = 'none';
                return;
            }
            
            select.classList.add('custom-select-hidden');
            select.style.display = 'none';
            
            const selectedOption = select.options[select.selectedIndex] || select.options[0];
            const selectedText = selectedOption ? selectedOption.text : '';
            
            const wrapper = document.createElement('div');
            wrapper.className = 'dropdown custom-select-wrapper';
            
            const trigger = document.createElement('button');
            trigger.className = 'form-select custom-select-trigger';
            trigger.type = 'button';
            trigger.setAttribute('data-bs-toggle', 'dropdown');
            trigger.setAttribute('aria-expanded', 'false');
            trigger.innerHTML = `
                <span class="custom-select-text text-truncate" style="padding-right: 8px;">${selectedText}</span>
                <i class="bi bi-chevron-down"></i>
            `;
            
            const menu = document.createElement('ul');
            menu.className = 'dropdown-menu w-100';
            
            Array.from(select.options).forEach(opt => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.className = 'dropdown-item text-truncate' + (opt.selected ? ' active' : '');
                a.href = '#';
                a.textContent = opt.text;
                a.setAttribute('data-value', opt.value);
                
                a.addEventListener('click', function(e) {
                    e.preventDefault();
                    menu.querySelectorAll('.dropdown-item').forEach(item => item.classList.remove('active'));
                    a.classList.add('active');
                    trigger.querySelector('.custom-select-text').textContent = opt.text;
                    select.value = opt.value;
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    select.dispatchEvent(new Event('input', { bubbles: true }));
                });
                
                li.appendChild(a);
                menu.appendChild(li);
            });
            
            wrapper.appendChild(trigger);
            wrapper.appendChild(menu);
            select.parentNode.insertBefore(wrapper, select.nextSibling);
            
            select.addEventListener('change', () => {
                const opt = select.options[select.selectedIndex];
                if (opt) {
                    trigger.querySelector('.custom-select-text').textContent = opt.text;
                    menu.querySelectorAll('.dropdown-item').forEach(item => {
                        if (item.getAttribute('data-value') === opt.value) {
                            item.classList.add('active');
                        } else {
                            item.classList.remove('active');
                        }
                    });
                }
            });
            
            const parentForm = select.closest('form');
            if (parentForm) {
                parentForm.addEventListener('reset', () => {
                    setTimeout(() => {
                        const opt = select.options[select.selectedIndex] || select.options[0];
                        if (opt) {
                            trigger.querySelector('.custom-select-text').textContent = opt.text;
                            menu.querySelectorAll('.dropdown-item').forEach(item => {
                                if (item.getAttribute('data-value') === opt.value) {
                                    item.classList.add('active');
                                } else {
                                    item.classList.remove('active');
                                }
                            });
                        }
                    }, 50);
                });
            }
            
            trigger.addEventListener('show.bs.dropdown', () => {
                menu.style.minWidth = trigger.offsetWidth + 'px';
            });
        });
    }

    window.initCustomSelects = initCustomSelects;
    window.downloadFileFromBase64 = function(filename, mimeType, base64) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    window.ecmisModalShow = function(id) {
        const el = document.getElementById(id);
        if (el) {
            let modal = bootstrap.Modal.getInstance(el);
            if (!modal) {
                modal = new bootstrap.Modal(el);
            }
            modal.show();
        }
    };

    window.ecmisModalHide = function(id) {
        const el = document.getElementById(id);
        if (el) {
            const modal = bootstrap.Modal.getInstance(el);
            if (modal) {
                modal.hide();
            }
        }
    };

    window.exportData = exportData;
    window.changeCaseStep = changeCaseStep;
    window.exportCaseDetailWord = exportCaseDetailWord;
    window.exportCaseDetailPdf = exportCaseDetailPdf;
    window.simulateDisclosureDetail = simulateDisclosureDetail;
    window.renderDisclosureDetail = renderDisclosureDetail;
    window.exportDisclosureDetailWord = exportDisclosureDetailWord;
    window.exportDisclosureDetailPdf = exportDisclosureDetailPdf;

    // 10.3 — คดีปกครอง
    window.selectAndShowAdminCaseDetail = selectAndShowAdminCaseDetail;
    window.openRecordResultModal103 = openRecordResultModal103;
    window.openWorkStatusModal103 = openWorkStatusModal103;
    window.downloadAdminDoc = downloadAdminDoc;

    // Expose switchView globally for Blazor JS interop
    window.switchView = switchView;
    window.initializeAll = initializeAll;

    // ==============================================
    // DASHBOARD & CHARTS (CHART.JS INTEGRATION)
    // ==============================================
    // NOTE: dashboardCharts is declared once at the top with the other state vars.

    function renderDashboardStatsAndCharts() {
        const stat101 = document.getElementById('db-stat-101');
        const stat102 = document.getElementById('db-stat-102');
        const stat103 = document.getElementById('db-stat-103');
        const winRate = document.getElementById('db-win-rate');

        if (stat101) stat101.innerText = DB_CASES_101.length;
        if (stat102) stat102.innerText = DB_REQUESTS_102.length + DB_APPEALS_102.length;
        if (stat103) stat103.innerText = DB_ADMIN_CASES_103.length;

        const wins = DB_ADMIN_CASES_103.filter(a => EcmisDomain.caseResult(a) === 'ชนะคดี').length;
        const losses = DB_ADMIN_CASES_103.filter(a => EcmisDomain.caseResult(a) === 'แพ้คดี').length;
        const totalClosed = wins + losses;
        const rate = totalClosed > 0 ? ((wins / totalClosed) * 100).toFixed(1) : '100.0';
        if (winRate) winRate.innerText = `${rate}%`;

        // TOR 10.3.5 — stage-duration & court-level statistics
        renderAdminStageStats();

        // Chart.js rendering (only if Chart is loaded)
        if (typeof Chart === 'undefined') return;

        for (let key in dashboardCharts) {
            if (dashboardCharts[key]) dashboardCharts[key].destroy();
        }

        const ctx1El = document.getElementById('chart-cases-type');
        if (ctx1El) {
            const ctx1 = ctx1El.getContext('2d');
            const typeCounts = { 'ไม่ฟ้อง': 0, 'ถอนฟ้อง': 0, 'ไม่อุทธรณ์': 0, 'ถอนอุทธรณ์': 0, 'ไม่ฎีกา': 0, 'ถอนฎีกา': 0 };
            DB_CASES_101.forEach(c => {
                if (typeCounts[c.type] !== undefined) typeCounts[c.type]++;
            });
            dashboardCharts.chart1 = new Chart(ctx1, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(typeCounts),
                    datasets: [{ data: Object.values(typeCounts), backgroundColor: ['#0D1B3E', '#1A2F6B', '#D5B45B', '#B8912F', '#0E7C7B', '#C0392B'], borderWidth: 2 }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Sarabun', size: 11 } } } }
                }
            });
        }

        const ctx2El = document.getElementById('chart-requests-monthly');
        if (ctx2El) {
            const ctx2 = ctx2El.getContext('2d');
            dashboardCharts.chart2 = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'],
                    datasets: [
                        { label: 'คำร้องขอข้อมูล', data: [12, 19, 14, 15, 18, 8], backgroundColor: '#1A2F6B' },
                        { label: 'คำอุทธรณ์', data: [2, 4, 1, 3, 2, 2], backgroundColor: '#D5B45B' }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, grid: { color: '#E3E9F4' } }, x: { grid: { display: false } } },
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Sarabun', size: 11 } } } }
                }
            });
        }

        const ctx3El = document.getElementById('chart-admin-results');
        if (ctx3El) {
            const ctx3 = ctx3El.getContext('2d');
            dashboardCharts.chart3 = new Chart(ctx3, {
                type: 'pie',
                data: {
                    labels: ['ชนะคดี', 'แพ้คดี', 'จำหน่ายคดี', 'อยู่ระหว่างศาล'],
                    datasets: [{ data: [wins, losses, DB_ADMIN_CASES_103.filter(a => EcmisDomain.caseResult(a) === 'จำหน่ายคดี').length, DB_ADMIN_CASES_103.filter(a => EcmisDomain.caseResult(a) === '—').length], backgroundColor: ['#1B7A4A', '#C0392B', '#6B7A99', '#D5B45B'] }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Sarabun', size: 11 } } } }
                }
            });
        }
    }

    // TOR 10.3.5 — สถิติระยะเวลาแต่ละขั้นตอน + ผลคดีแยกตามชั้นศาล + คดีถึงที่สุด
    function renderAdminStageStats() {
        // TOR 10.3.5 — คำนวณจาก history[] จริง (เดิม hardcode t1=4, t2=13, t3=182)
        const s = EcmisDomain.stageDurations(DB_ADMIN_CASES_103);
        const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = (v === null ? '—' : v); };
        setTxt('stage-t1', s.t1);
        setTxt('stage-t2', s.t2);
        setTxt('stage-t3', s.t3);
        setTxt('stage-total', s.total);

        const tbody = document.getElementById('admin-court-level-stats');
        if (!tbody) return;

        const levels = [
            { key: 'ชั้นต้น', label: 'ศาลปกครองชั้นต้น' },
            { key: 'สูงสุด', label: 'ศาลปกครองสูงสุด' }
        ];

        // นับจาก "คดีศาล" ไม่ใช่ "สำนวน" — 1 สำนวนแตกเป็นหลายคดีศาลได้
        const stats = EcmisDomain.winLossByLevel(DB_ADMIN_CASES_103);

        let html = '';
        let grand = { total: 0, win: 0, lose: 0, dismiss: 0, prog: 0, final: 0 };

        levels.forEach(lv => {
            const b = stats[lv.key];
            grand.total += b.total; grand.win += b.win; grand.lose += b.lose;
            grand.dismiss += b.dismiss; grand.prog += b.pending; grand.final += b.decided;

            html += `<tr>
                <td class="text-start fw-bold">${lv.label}</td>
                <td>${b.total}</td>
                <td class="text-success fw-bold">${b.win}</td>
                <td class="text-danger fw-bold">${b.lose}</td>
                <td>${b.dismiss}</td>
                <td>${b.pending}</td>
                <td>${b.decided}</td>
            </tr>`;
        });

        html += `<tr class="table-light fw-bold">
            <td class="text-start">รวมทั้งหมด</td>
            <td>${grand.total}</td>
            <td class="text-success">${grand.win}</td>
            <td class="text-danger">${grand.lose}</td>
            <td>${grand.dismiss}</td>
            <td>${grand.prog}</td>
            <td>${grand.final}</td>
        </tr>`;

        tbody.innerHTML = html;
    }

    window.renderDashboardStatsAndCharts = renderDashboardStatsAndCharts;

    // Register for Blazor enhanced page loads
    document.addEventListener('DOMContentLoaded', function() {
        if (window.Blazor) {
            Blazor.addEventListener('enhancedload', initializeAll);
        }
    });

