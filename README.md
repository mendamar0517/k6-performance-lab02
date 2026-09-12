# Lab 02 — Performance Testing with Grafana k6

## 1. Оюутны мэдээлэл

- **Оюутан:** О.Мэнд-Амар
- **Оюутны код:** B232270001
- **Хичээл:** Программ хангамжийн чанарын баталгаа ба туршилт
- **Лаборатори:** Lab 02 — Performance Testing

---

## 2. Лабораторийн зорилго

Энэхүү лабораторийн ажлын зорилго нь Grafana k6 ашиглан веб системийн гүйцэтгэлийг хэмжих, ачаалал нэмэгдэх үед системийн latency, throughput болон error rate хэрхэн өөрчлөгдөж байгааг судлахад оршино.

Туршилтад зөвшөөрөгдсөн public test target болох:

`https://test.k6.io`

ашигласан.

---

## 3. Test Environment

- **Operating System:** macOS
- **Device:** MacBook Air M2
- **Performance testing tool:** Grafana k6
- **Test target:** `https://test.k6.io`
- **Test duration:** 30 seconds – 1 minute depending on test
- **Virtual Users:** 5, 30, 100 VU

k6-ийн хувилбарыг `results/k6-version.txt` файлд хадгалсан.

---

## 4. k6 Test Script

Үндсэн performance test нь `script.js` файлд байрлана.

Тестийн үндсэн тохиргоо нь 5 VU, 30 секундын baseline test юм.

30 болон 100 VU туршилтыг command line-ээр тус тусад нь ажиллуулсан.

Жишээ командууд:

    k6 run --vus 30 --duration 1m script.js
    k6 run --vus 100 --duration 1m script.js

Ингэснээр 5, 30, 100 VU-ийн үр дүнг тусдаа хэмжиж, хооронд нь харьцуулсан.

---

## 5. Хэмжсэн Performance Metrics

### Latency

Latency нь request илгээгдсэнээс response буцаж ирэх хүртэлх хугацааг илэрхийлнэ.

Энэ лабораторийн ажилд `http_req_duration` metric-ийн дараах үзүүлэлтүүдийг ашигласан:

- **p90**
- **p95**

**p90** гэдэг нь нийт request-ийн 90% нь тухайн latency-ээс бага буюу тэнцүү хугацаанд хариу авсныг илэрхийлнэ.

**p95** гэдэг нь нийт request-ийн 95% нь тухайн latency-ээс бага буюу тэнцүү хугацаанд хариу авсныг илэрхийлнэ.

### Throughput

Throughput нь нэгж хугацаанд систем хэдэн request боловсруулах чадвартай байгааг илэрхийлнэ.

k6-ийн `http_reqs` metric-ийн секундэд ногдох request буюу `req/s` утгыг ашигласан.

### Error Rate

Error rate нь нийт request-ээс алдаатай болсон request-ийн хувь юм.

Энэ туршилтад `http_req_failed` metric-ийг ашигласан.

---

## 6. 5 / 30 / 100 VU-ийн харьцуулалт

| Load | p90 | p95 | Throughput | Error Rate |
|---:|---:|---:|---:|---:|
| **5 VU** | 256.85 ms | 297.95 ms | 7.23833 req/s | 0% |
| **30 VU** | 233.43 ms | 235.20 ms | 43.756468 req/s | 0% |
| **100 VU** | 233.24 ms | 235.37 ms | 144.041152 req/s | 0% |

### Үр дүнгийн тайлбар

5 VU-ийн baseline туршилтаар p95 latency **297.95 ms**, throughput **7.23833 req/s**, error rate **0%** гарсан.

30 VU үед p95 latency **235.20 ms** болж, throughput **43.756468 req/s** хүртэл нэмэгдсэн.

100 VU үед p95 latency **235.37 ms**, throughput **144.041152 req/s**, error rate **0%** байсан.

Ачааллыг 5-аас 100 VU хүртэл нэмэгдүүлэхэд throughput мэдэгдэхүйц өссөн боловч энэ туршилтаар p95 latency муудах үзэгдэл ажиглагдаагүй.

100 VU үед throughput нь baseline-тай харьцуулахад ойролцоогоор 20 дахин өссөн.

Гэхдээ 100 VU үед maximum latency **3.95 секунд** хүрсэн нь зарим request-д өндөр latency үүссэн outlier байгааг харуулж байна.

Энэ нь зөвхөн p95-ийг харахаас гадна maximum болон бусад percentile үзүүлэлтүүдийг хамтад нь авч үзэх шаардлагатайг харуулж байна.

---

## 7. Stage Test

`stages.js` файлд дараах staged load ашигласан:

- 30 секунд → 5 VU
- 1 минут → 30 VU
- 30 секунд → 100 VU
- 30 секунд → 0 VU

Энэ тест нь ачааллыг 5 → 30 → 100 VU хүртэл үе шаттайгаар нэмэгдүүлж, дараа нь 0 VU хүртэл бууруулсан.

Stage test-ийн нийт үр дүн:

- **p90:** 232.99 ms
- **p95:** 235.47 ms
- **Throughput:** 45.793537 req/s
- **Error rate:** 0%

Бүрэн output:

`results/stages.txt`

> Stage test-ийн aggregated result нь 5, 30, 100 VU-ийн тус тусын харьцуулалтын хүснэгтийн оронд ашиглагдаагүй. Учир нь нэг staged run нь бүх үеийн үр дүнг нэгтгэн харуулдаг. Иймээс 5, 30, 100 VU-ийн харьцуулалтыг тусдаа run-уудаар хийсэн.

---

## 8. SLO сонгосон үндэслэл

Энэ лабораторийн ажилд SLO threshold-ийг baseline хэмжилт дээр үндэслэн сонгосон.

Baseline-ийн p95 latency:

**297.95 ms**

SLO-г baseline p95-ийн 1.5 дахин их утгаар тооцсон:

**297.95 × 1.5 = 446.925 ms**

Ойролцоогоор:

**SLO p95 < 447 ms**

гэж сонгосон.

Мөн:

**Error rate < 1%**

гэсэн threshold ашигласан.

447 ms threshold нь дурын утга биш бөгөөд тухайн орчны baseline performance дээр үндэслэн сонгосон. Baseline-ийн p95-ээс 1.5 дахин өндөр хязгаар тогтоосноор baseline-тай харьцуулахад тодорхой хэмжээний performance variation гарах боломжийг тооцсон.

---

## 9. SLO Threshold — PASS

`threshold-pass.js` файлд дараах threshold-ийг тохируулсан:

- `http_req_duration`: `p(95)<447`
- `http_req_failed`: `rate<0.01`

Бодит үр дүн:

- **p95 = 234.92 ms**
- **Error rate = 0.00%**

Шалгалт:

- 234.92 ms < 447 ms
- 0.00% < 1%

Иймээс:

**SLO = PASS**

Бүрэн output:

`results/threshold-pass.txt`

---

## 10. SLO Threshold — FAIL

Threshold-ийн FAIL төлөвийг шалгахын тулд зориудаар хатуу threshold ашигласан:

`http_req_duration: p(95)<100`

Бодит үр дүн:

- **p95 = 234.85 ms**
- **Error rate = 0.00%**

Шалгалт:

- 234.85 ms > 100 ms

Иймээс latency threshold хангагдаагүй:

**SLO = FAIL**

Энэ `100 ms` нь үндсэн SLO биш бөгөөд k6-ийн threshold mechanism-ийн FAIL төлөвийг бодитоор харуулах зорилготой demonstration threshold юм.

Бүрэн output:

`results/threshold-fail.txt`

---

## 11. Дүгнэлт

Энэхүү лабораторийн ажлаар Grafana k6 ашиглан performance testing хийж, latency, throughput болон error rate үзүүлэлтүүдийг бодитоор хэмжсэн. 5 VU baseline туршилтаар p95 latency 297.95 ms, throughput 7.23833 req/s, error rate 0% гарсан. 30 VU үед throughput 43.756468 req/s болж мэдэгдэхүйц өссөн бөгөөд p95 latency 235.20 ms байсан. 100 VU үед throughput 144.041152 req/s хүрч, error rate 0% хэвээр хадгалагдсан. Энэ туршилтын хүрээнд ачаалал нэмэгдэхэд p95 latency өсөөгүй бөгөөд 30 болон 100 VU үед ойролцоо түвшинд байсан. Гэсэн хэдий ч 100 VU үед maximum latency 3.95 секунд хүрсэн нь зарим request-д өндөр latency үүссэн outlier байгааг харуулсан. Baseline-ийн p95 дээр үндэслэн 447 ms-ийн SLO сонгож, бодит threshold test-ээр PASS төлөвийг баталгаажуулсан. Мөн зориудаар 100 ms гэсэн хатуу threshold ашиглан FAIL төлөвийг амжилттай харуулсан. Иймээс k6 нь performance metrics-ийг тоон утгаар хэмжихээс гадна тодорхой SLO/threshold ашиглан системийн performance quality-г автоматаар үнэлэх боломжтойг туршилтаар харууллаа.

---

## 12. Evidence

Бодит k6 test output-ууд:

- [Baseline — 5 VU](results/run-baseline.txt)
- [30 VU](results/run-30vu.txt)
- [100 VU](results/run-100vu.txt)
- [Stage Test](results/stages.txt)
- [Threshold PASS](results/threshold-pass.txt)
- [Threshold FAIL](results/threshold-fail.txt)
- [k6 Version](results/k6-version.txt)

Test scripts:

- `script.js`
- `stages.js`
- `threshold-pass.js`
- `threshold-fail.js`

---

## 13. AI ашигласан тухай

Энэхүү лабораторийн ажлыг хийх явцад AI-ийг k6-ийн performance metrics, p90/p95, throughput, error rate болон threshold/SLO тохиргоог ойлгох, туршилтын үр дүнг тайлбарлах, README-ийн бүтцийг боловсруулахад туслах зорилгоор ашигласан.

Харин test target URL, k6 test execution болон дээрх performance measurement-үүдийг өөрөө ажиллуулж, бодит k6 output-оор шалгасан.

---

## 14. Файлын бүтэц

    k6-performance-lab02/
    ├── README.md
    ├── .gitignore
    ├── script.js
    ├── stages.js
    ├── threshold-pass.js
    ├── threshold-fail.js
    │
    └── results/
        ├── k6-version.txt
        ├── run-baseline.txt
        ├── run-30vu.txt
        ├── run-100vu.txt
        ├── stages.txt
        ├── threshold-pass.txt
        └── threshold-fail.txt
