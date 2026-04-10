def extract_corp_data_inserts(sql_text: str):
    target = "INSERT INTO corp_data"
    results = []

    i = 0
    n = len(sql_text)

    while i < n:
        start = sql_text.find(target, i)
        if start == -1:
            break

        end = sql_text.find(";", start)
        if end == -1:
            break

        statement = sql_text[start:end + 1].strip()
        results.append(statement)

        i = end + 1

    return results


with open("init_corps.sql", "r", encoding="utf-8") as f:
    sql_text = f.read()

corp_inserts = extract_corp_data_inserts(sql_text)

with open("corp_data_only.sql", "w", encoding="utf-8") as f:
    for stmt in corp_inserts:
        f.write(stmt + "\n\n")

for stmt in corp_inserts:
    print(stmt)
    print("-" * 80)

print(f"Saved {len(corp_inserts)} INSERT INTO corp_data statements to corp_data_only.sql")